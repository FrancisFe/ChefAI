using ChefAI.Application.DTOs.UserProfile;

namespace ChefAI.Application.Interfaces.Services
{
    public interface IUserProfileService
    {
        public Task<UserProfileDto> GetUserProfileAsync(int userId);
        public Task<UserProfileDto> UpdateUserProfileAsync(int userId, UserProfileUpdateDto updateDto);

        public Task AddDietaryRestrictionAsync(int userId, int DietaryRestrictionId);

    }
}
