using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Infraestructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChefAI.Infraestructure.Repositories
{
    public class ChallengeEntryRepository : IChallengeEntryRepository
    {
        private readonly AppDbContext _context;

        public ChallengeEntryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> UserHasParticipatedAsync(int userId)
        {
            return await _context.ChallengeEntries.AnyAsync(ce => ce.UserId == userId);
        }

        public async Task<int> GetTotalVotesReceivedAsync(int userId)
        {
            return await _context.ChallengeEntries
                .Where(ce => ce.UserId == userId)
                .SumAsync(ce => ce.VoteCount);
        }
    }
}
