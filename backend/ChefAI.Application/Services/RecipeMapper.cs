using ChefAI.Application.DTOs.Recipe;
using ChefAI.Domain.Entities;

namespace ChefAI.Application.Services
{
    public interface IRecipeMapper
    {
        Recipe MapToRecipeEntity(GeneratedRecipeDto generated, RecipeRequestDto request);
    }

    public class RecipeMapper : IRecipeMapper
    {
        public Recipe MapToRecipeEntity(GeneratedRecipeDto generated, RecipeRequestDto request)
        {
            return new Recipe
            {
                Title = generated.Title,
                Description = generated.Description,
                CookingTime = TimeSpan.FromMinutes(generated.CookingTimeMinutes),
                Servings = generated.Servings,
                UserId = request.UserId,
                CreatedAt = DateTime.UtcNow,
                Ingredients = generated.Ingredients
                    .Select(i => new RecipeIngredient
                    {
                        Name = i.Name,
                        Quantity = ParseIngredientQuantity(i.Quantity),
                        Unit = NormalizeUnit(i.Unit, i.Name)
                    })
                    .ToList(),
                Steps = string.Join("\n", generated.Steps ?? new List<string>())
            };
        }

        private decimal? ParseIngredientQuantity(string quantity)
        {
            if (string.IsNullOrWhiteSpace(quantity))
                return null;

            if (quantity.ToLower() is "a gusto" or "al gusto" or "0" or "")
                return null;

            return decimal.TryParse(quantity, out var result) ? result : null;
        }

        private string NormalizeUnit(string unit, string ingredientName)
        {
            if (string.IsNullOrWhiteSpace(unit))
                return "";

            if (unit.StartsWith("0"))
                return unit.Substring(1).Trim();

            return unit ?? "";
        }
    }
}
