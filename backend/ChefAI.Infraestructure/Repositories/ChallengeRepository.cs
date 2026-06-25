using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Domain.Entities;
using ChefAI.Domain.Enums;
using ChefAI.Infraestructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChefAI.Infraestructure.Repositories
{
    public class ChallengeRepository : IChallengeRepository
    {
        private readonly AppDbContext _context;
        public ChallengeRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<ChallengeEntry?> GetActiveAsync()
        {
            return await _context.ChallengeEntries
                .Where(ce => ce.Challenge.Status == ChallengeStatus.Active && ce.Challenge.StartDate <= DateTime.Now && ce.Challenge.EndDate >= DateTime.Now).FirstOrDefaultAsync();

        }

        public async Task<ChallengeEntry?> GetByIdAsync(int id)
        {
            return await _context.ChallengeEntries
                .Include(ce => ce.Challenge)
                .Include(ce => ce.User)
                .FirstOrDefaultAsync(ce => ce.Id == id);
        }

        public async Task<bool> HasUserParticipatedAsync(int challengeId, int userId)
        {
            return await _context.ChallengeEntries
                .AnyAsync(ce => ce.ChallengeId == challengeId && ce.UserId == userId);
        }
    }
}
