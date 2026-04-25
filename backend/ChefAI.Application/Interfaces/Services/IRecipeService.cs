using ChefAI.Application.DTOs.Recipe;

namespace ChefAI.Application.Interfaces.Services
{
    public interface IRecipeService
    {
        IAsyncEnumerable<string> GenerateRecipeAsync(RecipeRequestDto request, CancellationToken cancellationToken);
        Task<List<AllRecipesByUserIdDto>> GetAllRecipesByUserId(int userId);
    }
}
