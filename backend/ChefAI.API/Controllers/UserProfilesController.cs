using ChefAI.Application.DTOs.UserProfile;
using ChefAI.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChefAI.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserProfilesController : ControllerBase
    {
        private readonly IUserProfileService _userProfileService;

        public UserProfilesController(IUserProfileService userProfileService)
        {
            _userProfileService = userProfileService;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<UserProfileDto>> GetUserProfile(int userId)
        {
            var userProfile = await _userProfileService.GetUserProfileAsync(userId);
            return Ok(userProfile);
        }

        [HttpPut("{userId}")]
        public async Task<ActionResult<UserProfileDto>> UpdateUserProfile(int userId, [FromBody] UserProfileUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updatedProfile = await _userProfileService.UpdateUserProfileAsync(userId, updateDto);
            return Ok(updatedProfile);
        }

        [HttpPost("{userId}/dietary-restrictions/{dietaryRestrictionId}")]
        public async Task<ActionResult> AddDietaryRestriction(int userId, int dietaryRestrictionId)
        {
            await _userProfileService.AddDietaryRestrictionAsync(userId, dietaryRestrictionId);
            return Ok(new { message = "Dietary restriction added successfully" });
        }
    }
}
