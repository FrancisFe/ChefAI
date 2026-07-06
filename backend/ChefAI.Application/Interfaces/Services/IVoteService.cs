using ChefAI.Application.DTOs;

namespace ChefAI.Application.Interfaces.Services
{
    public interface IVoteService
    {
        Task<(PointsResult Points, List<BadgeResult> Badges)> VoteAsync(int userId, int challengeEntryId);
        Task<PointsResult> RemoveVoteAsync(int userId, int challengeEntryId);
    }
}
