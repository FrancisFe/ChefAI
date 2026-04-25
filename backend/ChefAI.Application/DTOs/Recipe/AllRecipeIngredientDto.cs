namespace ChefAI.Application.DTOs.Recipe
{
    public class AllRecipeIngredientDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal? Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
    }
}