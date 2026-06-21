using ChefAI.Domain.Entities;

namespace ChefAI.Application.Interfaces.Repositories
{
    public interface IRecipeRepository
    {
        public Task SaveAsync(Recipe recipe, CancellationToken cancellationToken);
        public Task<List<Recipe>> GetAllRecipesByUserId(int userId, bool favoritesOnly);

        public Task<Recipe?> GetByIdAsync(int recipeId);
        public Task SaveChangesAsync();
        
    }
}
