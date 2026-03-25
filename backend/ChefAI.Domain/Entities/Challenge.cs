using ChefAI.Domain.Enums;

namespace ChefAI.Domain.Entities
{
    public class Challenge
    {
        public int Id { get; set; }
        public int StarIngredientId { get; set; }
        public RecipeIngredient StarIngredient { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ChallengeStatus Status { get; set; }
        public List<ChallengeEntry> Entries { get; set; } = new();
    }
}
