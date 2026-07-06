using ChefAI.Domain.Entities;

namespace ChefAI.Application.Interfaces.Repositories
{
    public interface IChallengeRepository
    {
        Task<Challenge?> GetActiveAsync();
        Task<Challenge?> GetByIdAsync(int id);
        Task<List<Challenge>> GetAllAsync();
        Task<List<Challenge>> GetCompletedAsync();
        Task AddAsync(Challenge challenge);
        Task SaveChangesAsync();
    }
}
