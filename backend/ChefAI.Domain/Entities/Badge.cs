namespace ChefAI.Domain.Entities
{
    public class Badge
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string IconUrl { get; set; } = string.Empty;

        public List<UserBadge> UserBadges { get; set; } = new();

    }
}
