namespace ChefAI.Domain.Entities
{
    public class RecipeIngredient
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public int RecipeId { get; set; }
        public Recipe Recipe { get; set; } = null!;

    }
}
