namespace ChefAI.Domain.Entities
{
    public class UserProfile
    {
        public int Id { get; set; }
        public List<DietaryRestriction> DietaryRestrictions { get; set; } = new();
        public string PreferredDifficulty { get; set; } = string.Empty;
        public TimeSpan MaxCookingTime { get; set; } = TimeSpan.Zero;
        public int DefaultServings { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;

    }
}
