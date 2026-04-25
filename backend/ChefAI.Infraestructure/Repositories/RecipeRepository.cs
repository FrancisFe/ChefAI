using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Domain.Entities;
using ChefAI.Infraestructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChefAI.Infraestructure.Repositories
{
    public class RecipeRepository : IRecipeRepository
    {
        private readonly AppDbContext _context;
        public RecipeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task SaveAsync(Recipe recipe, CancellationToken cancellationToken)
        {
            await _context.Recipes.AddAsync(recipe, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<List<Recipe>> GetAllRecipesByUserId(int userId)
        {
            var recipes = await _context.Recipes
                .Where(r => r.UserId == userId)
                .Include(r => r.Ingredients)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
            return recipes;
        }
    }
}
