namespace ChefAI.Domain.Entities
{
    public class UserBadge
    {
        public int UserId { get; set; }
        public int BadgeId { get; set; }
        public DateTimeOffset EarnedAt { get; set; }
        public User User { get; set; } = null!;
        public Badge Badge { get; set; } = null!;
    }
}
