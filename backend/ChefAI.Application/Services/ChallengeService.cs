using ChefAI.Application.DTOs;
using ChefAI.Application.DTOs.Challenge;
using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Application.Interfaces.Services;
using ChefAI.Domain.Entities;
using ChefAI.Domain.Enums;

namespace ChefAI.Application.Services
{
    public class ChallengeService : IChallengeService
    {
        private readonly IChallengeRepository _challengeRepository;
        private readonly IChallengeEntryRepository _challengeEntryRepository;
        private readonly IRecipeRepository _recipeRepository;
        private readonly IGamificacionService _gamificacionService;

        public ChallengeService(
            IChallengeRepository challengeRepository,
            IChallengeEntryRepository challengeEntryRepository,
            IRecipeRepository recipeRepository,
            IGamificacionService gamificacionService)
        {
            _challengeRepository = challengeRepository;
            _challengeEntryRepository = challengeEntryRepository;
            _recipeRepository = recipeRepository;
            _gamificacionService = gamificacionService;
        }

        public async Task ActivateAsync(int challengeId)
        {
            var challenge = await _challengeRepository.GetByIdAsync(challengeId);
            if (challenge == null)
                throw new Exception("Challenge not found");

            challenge.Status = ChallengeStatus.Active;
            await _challengeRepository.SaveChangesAsync();
        }

        public Task CloseAsync(int challengeId)
        {
            throw new NotImplementedException();
        }

        public async Task<ChallengeResultDto> CreateAsync(RecipeIngredient recipeIngredient, DateTime startDate, DateTime endDate)
        {
            var challenge = new Challenge
            {
                StarIngredientId = recipeIngredient.Id,
                StarIngredient = recipeIngredient,
                StartDate = startDate,
                EndDate = endDate,
                Status = ChallengeStatus.Draft
            };
            await _challengeRepository.AddAsync(challenge);
            return new ChallengeResultDto
            {
                StarIngredient = recipeIngredient,
                StartDate = startDate,
                EndDate = endDate,
                Status = ChallengeStatus.Draft
            };
        }

        public async Task<PointsResult> ParticipateAsync(int challengeId, int recipeId, int userId)
        {
            var challenge = await _challengeRepository.GetByIdAsync(challengeId);
            if (challenge == null)
                throw new Exception("Challenge not found");

            if (challenge.Status != ChallengeStatus.Active)
                throw new Exception("Challenge is not active");

            var hasParticipated = await _challengeEntryRepository.UserHasParticipatedAsync(userId);
            if (hasParticipated)
                throw new Exception("User has already participated in a challenge");

            var recipe = await _recipeRepository.GetByIdAsync(recipeId);
            if (recipe == null)
                throw new Exception("Recipe not found");

            if (recipe.UserId != userId)
                throw new Exception("Recipe does not belong to the user");

            var entry = new ChallengeEntry
            {
                ChallengeId = challengeId,
                UserId = userId,
                RecipeId = recipeId,
                VoteCount = 0
            };

            await _challengeEntryRepository.AddAsync(entry);

            var pointsResult = await _gamificacionService.AddPoints(userId, GamificationAction.ParticipateInChallenge);
            await _gamificacionService.UpdateStreak(userId);
            await _gamificacionService.EvaluateBadges(userId);

            return pointsResult;
        }
    }
}
