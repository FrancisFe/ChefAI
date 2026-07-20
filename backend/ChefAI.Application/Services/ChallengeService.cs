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
        private readonly IVoteRepository _voteRepository;

        public ChallengeService(
            IChallengeRepository challengeRepository,
            IChallengeEntryRepository challengeEntryRepository,
            IRecipeRepository recipeRepository,
            IGamificacionService gamificacionService,
            IVoteRepository voteRepository)
        {
            _challengeRepository = challengeRepository;
            _challengeEntryRepository = challengeEntryRepository;
            _recipeRepository = recipeRepository;
            _gamificacionService = gamificacionService;
            _voteRepository = voteRepository;
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
            await AutoCloseExpiredAsync();

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

            var activeChallenges = await _challengeRepository.GetAllActiveAsync();
            foreach (var active in activeChallenges.Where(a => a.Id != challengeId))
            {
                active.Status = ChallengeStatus.Draft;
            }

            challenge.Status = ChallengeStatus.Active;
            challenge.StartDate = DateTime.Now;
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

        public async Task CancelAsync(int challengeId)
        {
            var challenge = await _challengeRepository.GetByIdAsync(challengeId);
            if (challenge == null)
                throw new Exception("Challenge not found");

            if (challenge.Status == ChallengeStatus.Completed)
                throw new InvalidOperationException("No se puede cancelar un desafío completado.");

            challenge.Status = ChallengeStatus.Cancelled;
            await _challengeRepository.SaveChangesAsync();
        }

        private async Task AutoCloseExpiredAsync()
        {
            var activeChallenges = await _challengeRepository.GetAllActiveAsync();
            var expired = activeChallenges.Where(c => c.EndDate <= DateTime.Now).ToList();

            if (expired.Count == 0) return;

            foreach (var challenge in expired)
            {
                challenge.Status = ChallengeStatus.Completed;
            }

            await _challengeRepository.SaveChangesAsync();
        }

        public async Task<List<ChallengeResultDto>> GetAllAsync()
        {
            var challenges = await _challengeRepository.GetAllAsync();
            return challenges.Select(c => new ChallengeResultDto
            {
                Id = c.Id,
                StarIngredientId = c.StarIngredientId,
                StarIngredientName = c.StarIngredient?.Name ?? string.Empty,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                Status = c.Status
            }).ToList();
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


        public async Task<PagedResponse<ChallengeFeedEntryDto>> GetFeedAsync(int challengeId, int userId, int page = 1, int pageSize = 20)
        {
            var challenge = await _challengeRepository.GetByIdAsync(challengeId);
            if (challenge == null)
                throw new KeyNotFoundException("No se encontró el desafío.");

            var entries = await _challengeEntryRepository.GetByChallengeIdAsync(challengeId);
            var totalCount = entries.Count;
            var pagedEntries = entries
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var entryIds = pagedEntries.Select(e => e.Id).ToList();
            var userVotedEntryIds = await _voteRepository.GetUserVotedEntryIdsAsync(userId, entryIds);

            var items = pagedEntries.Select(e => new ChallengeFeedEntryDto
            {
                EntryId = e.Id,
                RecipeId = e.RecipeId,
                RecipeTitle = e.Recipe.Title,
                OwnerUserId = e.UserId,
                OwnerName = e.User.UserName,
                VoteCount = e.VoteCount,
                HasVoted = userVotedEntryIds.Contains(e.Id)
            }).ToList();

            return new PagedResponse<ChallengeFeedEntryDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<List<ChallengeHistoryDto>> GetHistoryAsync()
        {
            var challenges = await _challengeRepository.GetHistoryAsync();
            return challenges.Select(c => new ChallengeHistoryDto
            {
                Id = c.Id,
                StarIngredientName = c.StarIngredient?.Name ?? string.Empty,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                ParticipationCount = c.Entries.Count,
                Status = c.Status.ToString()
            }).ToList();
        }

        public async Task<List<TotalPointsRankingDto>> GetTotalPointsRankingAsync()
        {
            var entries = await _challengeEntryRepository.GetAllEntriesWithUserAsync();

            var ranking = entries
                .GroupBy(e => e.UserId)
                .Select(g => new TotalPointsRankingDto
                {
                    UserId = g.Key,
                    UserName = g.First().User.UserName,
                    TotalVotes = g.Sum(e => e.VoteCount)
                })
                .OrderByDescending(r => r.TotalVotes)
                .ToList();

            var rank = 1;
            foreach (var item in ranking)
            {
                item.Rank = rank++;
            }

            return ranking;
        }
    }
}
