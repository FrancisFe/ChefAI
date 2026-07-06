namespace ChefAI.Domain.Entities
{
    public class Vote
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public int ChallengeEntryId { get; set; }
        public ChallengeEntry ChallengeEntry { get; set; } = null!;
        public DateTime CreatedAt { get; set; }

    }
}
