namespace ChefAI.Application.DTOs.Recipe
{
    public class RecipeRequestDto
    {
        public List<string> Ingredients { get; set; } = new();

        public int UserId { get; set; }

        public int? Servings { get; set; }

        public int? MaxCookingTimeMinutes { get; set; }

        public string? Difficulty { get; set; }
    }
}
