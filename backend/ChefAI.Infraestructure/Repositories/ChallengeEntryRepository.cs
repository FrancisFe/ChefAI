using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Domain.Entities;
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

        public async Task<bool> HasParticipatedAsync(int challengeId, int userId)
        {
            return await _context.ChallengeEntries.AnyAsync(ce => ce.ChallengeId == challengeId && ce.UserId == userId);
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

        public async Task<ChallengeEntry?> GetByIdAsync(int id)
        {
            return await _context.ChallengeEntries
                .Include(ce => ce.Challenge)
                .Include(ce => ce.Recipe)
                .FirstOrDefaultAsync(ce => ce.Id == id);
        }

        public async Task<List<ChallengeEntry>> GetByChallengeIdAsync(int challengeId)
        {
            return await _context.ChallengeEntries
                .Where(ce => ce.ChallengeId == challengeId)
                .Include(ce => ce.Recipe)
                .Include(ce => ce.User)
                .OrderByDescending(ce => ce.VoteCount)
                .ToListAsync();
        }

        public async Task AddAsync(ChallengeEntry entry)
        {
            await _context.ChallengeEntries.AddAsync(entry);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ChallengeEntry entry)
        {
            _context.ChallengeEntries.Update(entry);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
