namespace ChefAI.Domain.Entities
{
    public class UserPoints
    {
        public int Id { get; set; }
        public int TotalPoints { get; set; }
        public int UserStreak { get; set; } = 0;
        public DateTimeOffset LastActivityDate { get; set; } = DateTimeOffset.UtcNow;
        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
