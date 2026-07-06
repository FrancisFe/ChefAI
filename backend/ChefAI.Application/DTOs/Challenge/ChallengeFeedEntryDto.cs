namespace ChefAI.Application.DTOs.Challenge
{
    public class ChallengeFeedEntryDto
    {
        public int EntryId { get; set; }
        public int RecipeId { get; set; }
        public string RecipeTitle { get; set; } = string.Empty;
        public int OwnerUserId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public int VoteCount { get; set; }
        public bool HasVoted { get; set; }
    }
}