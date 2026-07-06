using ChefAI.Domain.Entities;

namespace ChefAI.Application.Interfaces.Repositories
{
    public interface IChallengeEntryRepository
    {
        Task<bool> HasParticipatedAsync(int challengeId, int userId);
        Task<bool> UserHasParticipatedAsync(int userId);
        Task<int> GetTotalVotesReceivedAsync(int userId);
        Task<ChallengeEntry?> GetByIdAsync(int id);
        Task<List<ChallengeEntry>> GetByChallengeIdAsync(int challengeId);
        Task AddAsync(ChallengeEntry entry);
        Task UpdateAsync(ChallengeEntry entry);
        Task SaveChangesAsync();
    }
}
