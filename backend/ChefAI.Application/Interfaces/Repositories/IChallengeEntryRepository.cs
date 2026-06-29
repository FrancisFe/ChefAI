using ChefAI.Domain.Entities;

namespace ChefAI.Application.Interfaces.Repositories
{
    public interface IChallengeEntryRepository
    {
        Task<bool> HasParticipatedAsync(int challengeId, int userId);
        Task<bool> UserHasParticipatedAsync(int userId);
        Task<int> GetTotalVotesReceivedAsync(int userId);
        Task AddAsync(ChallengeEntry entry);
    }
}
