using ChefAI.Application.DTOs.Recipe;

namespace ChefAI.Application.Interfaces.Services
{
    public interface IRecipeService
    {
        IAsyncEnumerable<string> GenerateRecipeAsync(RecipeRequestDto request, CancellationToken cancellationToken);
        Task<List<AllRecipesByUserIdDto>> GetUserRecipeHistory(int userId , bool favoritesOnly);
        Task<AllRecipesByUserIdDto?> GetRecipeByIdAsync(int recipeId);
        public Task AddFavorite(int recipeId, int userId);
        public Task RemoveFavorite(int recipeId, int userId);
    }
}
