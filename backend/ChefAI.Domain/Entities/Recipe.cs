namespace ChefAI.Domain.Entities
{
    public class Recipe
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public TimeSpan CookingTime { get; set; }
        public int Servings { get; set; }
        public bool IsFavorite { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<RecipeIngredient> Ingredients { get; set; } = new();
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public List<DietaryRestriction> DietaryRestrictions { get; set; } = new();
        public List<ChallengeEntry> ChallengeEntries { get; set; } = new();

    }
}
