namespace ChefAI.Application.DTOs.Ranking
{
    public class RankingEntryDto
    {
        public int EntryId { get; set; }
        public int RecipeId { get; set; }
        public string RecipeTitle { get; set; } = string.Empty;
        public int OwnerUserId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public int VoteCount { get; set; }
    }
}
