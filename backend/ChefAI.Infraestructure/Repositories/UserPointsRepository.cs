using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Domain.Entities;
using ChefAI.Infraestructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChefAI.Infraestructure.Repositories
{
    public class UserPointsRepository : IUserPointsRepository
    {
        private readonly AppDbContext _context;
        public UserPointsRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<UserPoints?> GetByUserIdAsync(int userId)
        {
            return await _context.UserPoints.FirstOrDefaultAsync(up => up.UserId == userId);
        }

        public async Task UpdateAsync(UserPoints userPoints)
        {
            await _context.SaveChangesAsync();
        }
        public async Task<UserPoints> AddAsync(UserPoints userPoints)
        {
            _context.UserPoints.Add(userPoints);
            await _context.SaveChangesAsync();
            return userPoints;
        }
    }
}
