namespace ChefAI.Application.DTOs.Recipe
{
    public class GeneratedRecipeDto
    {
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public int CookingTimeMinutes { get; set; }
        public int Servings { get; set; }
        public List<GeneratedIngredientDto> Ingredients { get; set; } = new();
        public List<string> Steps { get; set; } = new();

    }
}
