using ChefAI.Domain.Entities;

namespace ChefAI.Application.Interfaces.Repositories
{
    public interface IRecipeRepository
    {
        public Task SaveAsync(Recipe recipe, CancellationToken cancellationToken);
    }
}
