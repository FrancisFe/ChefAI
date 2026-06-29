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

        public async Task<ChallengeResultDto?> GetChallengeByIdAsync(int challengeId)
        {
            var challenge = await _challengeRepository.GetByIdAsync(challengeId);
            if (challenge == null)
                throw new Exception("Challenge not found");
            return new ChallengeResultDto
            {
                Id = challenge.Id,
                StarIngredientId = challenge.StarIngredientId,
                StarIngredientName = challenge.StarIngredient?.Name ?? string.Empty,
                StartDate = challenge.StartDate,
                EndDate = challenge.EndDate,
                Status = challenge.Status
            };
        }

        public async Task<ChallengeResultDto?> GetActiveChallengeAsync(int? userId = null)
        {
            var challenge = await _challengeRepository.GetActiveAsync();
            if (challenge == null)
                return null;

            var hasParticipated = userId.HasValue
                ? await _challengeEntryRepository.HasParticipatedAsync(challenge.Id, userId.Value)
                : false;

            return new ChallengeResultDto
            {
                Id = challenge.Id,
                StarIngredientId = challenge.StarIngredientId,
                StarIngredientName = challenge.StarIngredient?.Name ?? string.Empty,
                StartDate = challenge.StartDate,
                EndDate = challenge.EndDate,
                Status = challenge.Status,
                HasParticipated = hasParticipated
            };
        }

        public async Task ActivateAsync(int challengeId)
        {
            var challenge = await _challengeRepository.GetByIdAsync(challengeId);
            if (challenge == null)
                throw new Exception("Challenge not found");

            challenge.Status = ChallengeStatus.Active;
            await _challengeRepository.SaveChangesAsync();
        }

        public async Task CloseAsync(int challengeId)
        {
            var challenge =await _challengeRepository.GetByIdAsync(challengeId);
            if(challenge == null)
            {
                throw new Exception("Challenge not found");
            }
            challenge.Status = ChallengeStatus.Completed;
            await _challengeRepository.SaveChangesAsync();

        }



        public async Task<List<IngredientListItemDto>> GetAvailableIngredientsAsync()
        {
            return await _recipeRepository.GetDistinctIngredientsAsync();
        }

        public async Task<ChallengeResultDto> CreateAsync(CreateChallengeRequest request)
        {

            var challenge = new Challenge
            {
                StarIngredientId = request.StarIngredientId,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Status = ChallengeStatus.Draft
            };
            await _challengeRepository.AddAsync(challenge);
            return new ChallengeResultDto
            {
                Id = challenge.Id,
                StarIngredientId = request.StarIngredientId,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Status = ChallengeStatus.Draft
            };
        }

        public async Task<PointsResult> ParticipateAsync(int challengeId, int recipeId, int userId)
        {
            var challenge = await _challengeRepository.GetByIdAsync(challengeId);
            if (challenge == null)
                throw new KeyNotFoundException("No se encontró el desafío.");

            if (challenge.Status != ChallengeStatus.Active)
                throw new InvalidOperationException("El desafío no está activo.");

            var hasParticipated = await _challengeEntryRepository.HasParticipatedAsync(challengeId, userId);
            if (hasParticipated)
                throw new InvalidOperationException("Ya participaste en este desafío.");

            var recipe = await _recipeRepository.GetByIdAsync(recipeId);
            if (recipe == null)
                throw new KeyNotFoundException("No se encontró la receta.");

            if (recipe.UserId != userId)
                throw new UnauthorizedAccessException("La receta no te pertenece.");

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
