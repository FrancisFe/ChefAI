using ChefAI.Application.DTOs.UserProfile;

namespace ChefAI.Application.Interfaces.Services
{
    public interface IDietaryRestrictionService
    {
        Task<DietaryRestrictionsDto> GetByIdAsync(int id);
        Task<List<DietaryRestrictionsDto>> GetAllAsync();
    }
}
