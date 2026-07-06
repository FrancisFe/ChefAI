using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Domain.Entities;
using ChefAI.Infraestructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChefAI.Infraestructure.Repositories
{
    public class VoteRepository : IVoteRepository
    {
        private readonly AppDbContext _context;
        public VoteRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Vote?> GetByUserAndEntryAsync(int userId, int challengeEntryId)
        {
            return await _context.Votes
                .FirstOrDefaultAsync(v => v.UserId == userId && v.ChallengeEntryId == challengeEntryId);
        }

        public async Task<HashSet<int>> GetUserVotedEntryIdsAsync(int userId, List<int> entryIds)
        {
            var voted = await _context.Votes
                .Where(v => v.UserId == userId && entryIds.Contains(v.ChallengeEntryId))
                .Select(v => v.ChallengeEntryId)
                .ToListAsync();
            return voted.ToHashSet();
        }

        public async Task AddAsync(Vote vote)
        {
            await _context.Votes.AddAsync(vote);
        }

        public async Task RemoveAsync(Vote vote)
        {
            _context.Votes.Remove(vote);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
