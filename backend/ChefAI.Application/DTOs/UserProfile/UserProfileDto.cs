

namespace ChefAI.Application.DTOs.UserProfile
{
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PreferredDifficulty { get; set; } = string.Empty;
        public TimeSpan MaxCookingTime { get; set; } = TimeSpan.Zero;
        public int DefaultServings { get; set; }
        public List<DietaryRestrictionsDto> DietaryRestrictions { get; set; } = new();
    }
}
