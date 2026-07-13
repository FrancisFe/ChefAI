using ChefAI.Application.DTOs;
using ChefAI.Application.DTOs.Challenge;

namespace ChefAI.Application.Interfaces.Services
{
    public interface IChallengeService
    {
        public Task<ChallengeResultDto> CreateAsync(CreateChallengeRequest request);
        public Task ActivateAsync(int challengeId);
        public Task CancelAsync(int challengeId);
        public Task<PointsResult> ParticipateAsync(int challengeId, int recipeId, int userId);
        public Task CloseAsync(int challengeId);
        public Task<ChallengeResultDto?> GetChallengeByIdAsync(int challengeId);
        public Task<ChallengeResultDto?> GetActiveChallengeAsync(int? userId = null);
        public Task<List<ChallengeResultDto>> GetAllAsync();
        public Task<List<ChallengeHistoryDto>> GetHistoryAsync();
        public Task<List<IngredientListItemDto>> GetAvailableIngredientsAsync();
        public Task<PagedResponse<ChallengeFeedEntryDto>> GetFeedAsync(int challengeId, int userId, int page = 1, int pageSize = 20);
        public Task<List<TotalPointsRankingDto>> GetTotalPointsRankingAsync();
    }
}
