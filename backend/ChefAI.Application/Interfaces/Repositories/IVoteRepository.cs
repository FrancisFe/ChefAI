using ChefAI.Domain.Entities;

namespace ChefAI.Application.Interfaces.Repositories
{
    public interface IVoteRepository
    {
        Task<Vote?> GetByUserAndEntryAsync(int userId, int challengeEntryId);
        Task<HashSet<int>> GetUserVotedEntryIdsAsync(int userId, List<int> entryIds);
        Task AddAsync(Vote vote);
        Task RemoveAsync(Vote vote);
        Task SaveChangesAsync();
    }
}
