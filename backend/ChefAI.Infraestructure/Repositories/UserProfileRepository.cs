using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Domain.Entities;
using ChefAI.Infraestructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChefAI.Infraestructure.Repositories
{
    public class UserProfileRepository : IUserProfileRepository
    {
        private readonly AppDbContext _context;
        public UserProfileRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<UserProfile> AddAsync(UserProfile profile)
        {
            await _context.Profiles.AddAsync(profile);
            await _context.SaveChangesAsync();
            return profile;
        }

        public async Task<UserProfile> UpdateAsync(UserProfile profile)
        {
            _context.Profiles.Update(profile);
            await _context.SaveChangesAsync();
            return profile;
        }

        public async Task<UserProfile?> GetByUserIdAsync(int userId)
        {
            return await _context.Profiles.Include(p => p.DietaryRestrictions)
                .FirstOrDefaultAsync(p => p.UserId == userId);
        }

        public async Task<bool> ExistsByUserIdAsync(int userId)
        {
            return await _context.Profiles.AnyAsync(p => p.UserId == userId);
        }

        public async Task DeleteAsync(int profileId)
        {
            var profile = await _context.Profiles.FindAsync(profileId);
            if (profile != null)
            {
                _context.Profiles.Remove(profile);
                await _context.SaveChangesAsync();
            }
        }
    }
}
