namespace ChefAI.Application.DTOs.UserProfile
{
    public class UserProfileUpdateDto
    {
        public List<DietaryRestrictionsDto> DietaryRestrictions { get; set; } = new();
        public string PreferredDifficulty { get; set; } = string.Empty;
        public TimeSpan MaxCookingTime { get; set; } = TimeSpan.Zero;
        public int DefaultServings { get; set; }
    }
}