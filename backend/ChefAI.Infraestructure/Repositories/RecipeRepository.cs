using ChefAI.Application.DTOs.Challenge;
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

        public async Task<List<Recipe>> GetAllRecipesByUserId(int userId, bool favoritesOnly)
        {
            IQueryable<Recipe> query = _context.Recipes
                .Where(r => r.UserId == userId)
                .Include(r => r.Ingredients);

            if (favoritesOnly)
            {
                query = query.Where(r => r.IsFavorite);
            }

            return await query
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

        }

        public async Task<Recipe?> GetByIdAsync(int recipeId)
        {
            var recipe = await _context.Recipes
                .Include(r => r.Ingredients)
                .FirstOrDefaultAsync(r => r.Id == recipeId);
            return recipe;
        }
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<List<IngredientListItemDto>> GetDistinctIngredientsAsync()
        {
            return await _context.RecipeIngredients
                .GroupBy(i => i.Name.ToLower())
                .Select(g => new IngredientListItemDto
                {
                    Id = g.Min(i => i.Id),
                    Name = g.First().Name
                })
                .OrderBy(i => i.Name)
                .ToListAsync();
        }
    }
}
