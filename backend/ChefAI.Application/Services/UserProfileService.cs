using ChefAI.Application.DTOs.UserProfile;
using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Application.Interfaces.Services;

namespace ChefAI.Application.Services
{
    public class UserProfileService : IUserProfileService
    {
        private readonly IUserProfileRepository _userProfileRepository;
        private readonly IDietaryRestrictionRepository _dietaryRestriction;
        public UserProfileService(IUserProfileRepository userProfileRepository, IDietaryRestrictionRepository dietaryRestrictionRepository)
        {
            _userProfileRepository = userProfileRepository;
            _dietaryRestriction = dietaryRestrictionRepository;
        }
     

        public async Task<UserProfileDto> GetUserProfileAsync(int userId)
        {
            var userProfile = await _userProfileRepository.GetByUserIdAsync(userId);
            if (userProfile == null)
            {
                throw new KeyNotFoundException("User not found");
            }
            var userProfileDto = new UserProfileDto
            {
                Id = userProfile.Id,
                PreferredDifficulty = userProfile.PreferredDifficulty,
                MaxCookingTime = userProfile.MaxCookingTime,
                DefaultServings = userProfile.DefaultServings,
                DietaryRestrictions = userProfile.DietaryRestrictions.Select(r => new DietaryRestrictionsDto
                {
                    Name = r.Name,
                    Description = r.Description
                }).ToList()
            };
            return userProfileDto;
        }

        public async Task<UserProfileDto> UpdateUserProfileAsync(int userId, UserProfileUpdateDto updateDto)
        {
            var userProfile = await _userProfileRepository.GetByUserIdAsync(userId);
            if (userProfile == null)
            {
                throw new KeyNotFoundException("User not found");
            }
            userProfile.PreferredDifficulty = updateDto.PreferredDifficulty;
            userProfile.DefaultServings = updateDto.DefaultServings;
            userProfile.MaxCookingTime = updateDto.MaxCookingTime;

            await _userProfileRepository.UpdateAsync(userProfile);

            return new UserProfileDto
            {
                Id = userProfile.Id,
                PreferredDifficulty = userProfile.PreferredDifficulty,
                MaxCookingTime = userProfile.MaxCookingTime,
                DefaultServings = userProfile.DefaultServings,
                DietaryRestrictions = userProfile.DietaryRestrictions
           .Select(dr => new DietaryRestrictionsDto
           {
               Name = dr.Name,
               Description = dr.Description
           })
           .ToList()
            };
        }

        public async Task AddDietaryRestrictionAsync(int userId, int dietaryRestrictionId)
        {
            var userProfile = await _userProfileRepository.GetByUserIdAsync(userId);
            if (userProfile == null) {
                throw new KeyNotFoundException("User not found");
            }
            var restriction = await _dietaryRestriction.GetByIdAsync(dietaryRestrictionId);
            if (restriction == null)
            {
                throw new KeyNotFoundException("Dietary restriction not found");
            }

            if (userProfile.DietaryRestrictions
                .Any(r => r.Id == dietaryRestrictionId))
            {
                return;
            }

            userProfile.DietaryRestrictions.Add(restriction);

            await _userProfileRepository.UpdateAsync(userProfile);
        }
    }
}
