using ChefAI.Domain.Entities;

namespace ChefAI.Application.Interfaces.Repositories
{
    public interface IUserPointsRepository
    {
        Task<UserPoints?> GetByUserIdAsync(int userId);
        Task UpdateAsync(UserPoints userPoints);
    }
}
