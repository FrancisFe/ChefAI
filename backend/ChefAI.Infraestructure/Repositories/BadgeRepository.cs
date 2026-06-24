using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Domain.Entities;
using ChefAI.Infraestructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChefAI.Infraestructure.Repositories
{
    public class BadgeRepository : IBadgeRepository
    {
        private readonly AppDbContext _context;

        public BadgeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Badge>> GetAllAsync()
        {
            return await _context.Badges.ToListAsync();
        }

        public async Task<List<UserBadge>> GetUserBadgesAsync(int userId)
        {
            return await _context.UserBadges
                .Where(ub => ub.UserId == userId)
                .ToListAsync();
        }

        public async Task AddUserBadgesAsync(List<UserBadge> userBadges)
        {
            await _context.UserBadges.AddRangeAsync(userBadges);
            await _context.SaveChangesAsync();
        }
    }
}
