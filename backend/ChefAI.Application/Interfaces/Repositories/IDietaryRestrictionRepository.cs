using ChefAI.Domain.Entities;

namespace ChefAI.Application.Interfaces.Repositories
{
    public interface IDietaryRestrictionRepository
    {
        Task<DietaryRestriction?> GetByIdAsync(int id);
        Task<List<DietaryRestriction>> GetAllAsync();
    }
}
