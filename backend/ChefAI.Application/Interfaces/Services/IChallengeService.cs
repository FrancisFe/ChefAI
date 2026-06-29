using ChefAI.Application.DTOs;
using ChefAI.Application.DTOs.Challenge;
using ChefAI.Domain.Entities;

namespace ChefAI.Application.Interfaces.Services
{
    public interface IChallengeService
    {
        public Task<ChallengeResultDto> CreateAsync(RecipeIngredient recipeIngredient, DateTime startDate, DateTime endDate);
        public Task ActivateAsync(int challengeId);
        public Task<PointsResult> ParticipateAsync(int challengeId, int recipeId, int userId);
        public Task CloseAsync(int challengeId);
    }
}
