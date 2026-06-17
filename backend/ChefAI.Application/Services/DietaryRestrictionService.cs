using ChefAI.Application.DTOs.UserProfile;
using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Application.Interfaces.Services;

namespace ChefAI.Application.Services
{
    public class DietaryRestrictionService : IDietaryRestrictionService
    {
        private readonly IDietaryRestrictionRepository _dietaryRestrictionRepository;

        public DietaryRestrictionService(IDietaryRestrictionRepository dietaryRestrictionRepository)
        {
            _dietaryRestrictionRepository = dietaryRestrictionRepository;
        }

        public async Task<List<DietaryRestrictionsDto>> GetAllAsync()
        {
            var dietaryRestrictions = await _dietaryRestrictionRepository.GetAllAsync();
            return dietaryRestrictions.Select(dr => new DietaryRestrictionsDto
            {
                Name = dr.Name,
                Description = dr.Description
            }).ToList();
        }

        public async Task<DietaryRestrictionsDto> GetByIdAsync(int id)
        {
            var dietaryRestriction = await _dietaryRestrictionRepository.GetByIdAsync(id);
            if (dietaryRestriction == null)
            {
                throw new KeyNotFoundException($"Dietary restriction with ID {id} not found.");
            }

            return new DietaryRestrictionsDto
            {
                Name = dietaryRestriction.Name,
                Description = dietaryRestriction.Description
            };
        }
    }
}
