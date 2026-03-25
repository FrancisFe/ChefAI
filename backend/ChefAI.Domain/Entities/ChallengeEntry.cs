namespace ChefAI.Domain.Entities
{
    public class ChallengeEntry
    {
        public int Id { get; set; }
        public int ChallengeId { get; set; }
        public int UserId { get; set; }
        public int RecipeId { get; set; }
        public int VoteCount { get; set; }
        public Challenge Challenge { get; set; } = null!;
        public User User { get; set; } = null!;
        public Recipe Recipe { get; set; } = null!;

    }
}
