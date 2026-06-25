using ChefAI.Domain.Entities;

namespace ChefAI.Application.Interfaces.Repositories
{
    public interface IChallengeRepository
    {
        Task<ChallengeEntry?> GetActiveAsync();
        Task<ChallengeEntry?> GetByIdAsync(int id);
        Task<bool> HasUserParticipatedAsync(int challengeId, int userId);
    }
}
