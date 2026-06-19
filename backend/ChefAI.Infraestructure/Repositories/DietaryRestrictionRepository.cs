using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Domain.Entities;
using ChefAI.Infraestructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChefAI.Infraestructure.Repositories
{
    public class DietaryRestrictionRepository : IDietaryRestrictionRepository
    {
        private readonly AppDbContext _context;
        public DietaryRestrictionRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<List<DietaryRestriction>> GetAllAsync()
        {
            return await _context.DietaryRestrictions.ToListAsync();
        }

        public async Task<DietaryRestriction?> GetByIdAsync(int id)
        {
            return await _context.DietaryRestrictions.FirstOrDefaultAsync(dr => dr.Id == id);
        }
    }
}
