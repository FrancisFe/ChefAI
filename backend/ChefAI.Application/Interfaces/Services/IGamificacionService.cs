using ChefAI.Application.DTOs;
using ChefAI.Domain.Enums;

namespace ChefAI.Application.Interfaces.Services
{
    public interface IGamificacionService
    {
        Task<PointsResult> AddPoints(int userId, GamificationAction action);
        Task<StreakResult> UpdateStreak(int userId);
        Task<PointsResult> DeductPoints(int userId, int points);
        Task<List<BadgeResult>> EvaluateBadges(int userId);
        Task<PointsDto> GetUserPointsAsync(int userId);
        Task<List<BadgeStatusDto>> GetUserBadgesWithStatusAsync(int userId);
    }
}
