using ChefAI.Domain.Enums;

namespace ChefAI.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; }
        public string? RefreshToken { get; set; }
        public DateTimeOffset? TokenExpires { get; set; }
        public UserRole Role { get; set; } = UserRole.User;
        public UserProfile UserProfile { get; set; } = null!;
        public UserPoints UserPoints { get; set; } = null!;
        public List<Recipe> Recipes { get; set; } = new();
        public List<ChallengeEntry> ChallengeEntries { get; set; } = new();
        public List<UserBadge> UserBadges { get; set; } = new();
    }
}
