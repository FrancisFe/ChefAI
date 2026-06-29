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

        public async Task<Challenge?> GetActiveAsync()
        {
            return await _context.Challenges
                .Include(c => c.StarIngredient)
                .Where(c => c.Status == ChallengeStatus.Active
                    && c.StartDate <= DateTime.Now
                    && c.EndDate >= DateTime.Now)
                .FirstOrDefaultAsync();
        }

        public async Task<Challenge?> GetByIdAsync(int id)
        {
            return await _context.Challenges
                .Include(c => c.StarIngredient)
                .Include(c => c.Entries)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<List<Challenge>> GetAllAsync()
        {
            return await _context.Challenges
                .Include(c => c.StarIngredient)
                .OrderByDescending(c => c.StartDate)
                .ToListAsync();
        }

        public async Task AddAsync(Challenge challenge)
        {
            await _context.Challenges.AddAsync(challenge);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
