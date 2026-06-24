using ChefAI.Domain.Entities;

namespace ChefAI.Application.Interfaces.Repositories
{
    public interface IBadgeRepository
    {
        Task<List<Badge>> GetAllAsync();
        Task<List<UserBadge>> GetUserBadgesAsync(int userId);
        Task AddUserBadgesAsync(List<UserBadge> userBadges);
    }
}
