using ChefAI.Application.DTOs.Recipe;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

namespace ChefAI.Application.Services
{
    public interface IRecipeTextParser
    {
        GeneratedRecipeDto? ParseRecipeFromText(string text);
    }

    public class RecipeTextParser : IRecipeTextParser
    {
        private readonly ILogger<RecipeTextParser> _logger;

        public RecipeTextParser(ILogger<RecipeTextParser> logger)
        {
            _logger = logger;
        }

        public GeneratedRecipeDto? ParseRecipeFromText(string text)
        {
            try
            {
                text = text.Replace("\\n", "\n");

                text = text.Replace("[DONE]", "").Trim();

                var lines = text.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
                var recipe = new GeneratedRecipeDto
                {
                    Title = "",
                    Description = "",
                    CookingTimeMinutes = 30,
                    Servings = 4,
                    Ingredients = new List<GeneratedIngredientDto>(),
                    Steps = new List<string>()
                };

                int currentSection = 0;
                var ingredientLines = new List<string>();
                var stepLines = new List<string>();

                for (int i = 0; i < lines.Length; i++)
                {
                    var line = lines[i].Trim();

                    if (string.IsNullOrWhiteSpace(line))
                        continue;

                    if (line.StartsWith("# ") && currentSection == 0)
                    {
                        recipe.Title = line.Substring(2).Trim();
                        currentSection = 1;
                        continue;
                    }

                    if (line.StartsWith("## ") && line.Contains("Ingrediente"))
                    {
                        currentSection = 2;
                        continue;
                    }

                    if (line.StartsWith("## ") && (line.Contains("Paso") || line.Contains("paso")))
                    {
                        currentSection = 3;
                        continue;
                    }

                    if (line.Contains("Tiempo:"))
                    {
                        ExtractMetaInfo(line, recipe);
                    }

                    if (currentSection == 2 && (line.StartsWith("- ") || line.StartsWith("* ")))
                    {
                        ingredientLines.Add(line.Substring(2).Trim());
                    }

                    if (currentSection == 3)
                    {
                        if (line.StartsWith("##") || line.StartsWith("#") || line.StartsWith("---"))
                            continue;

                        var stepText = line;

                        if (line.StartsWith("- ") || line.StartsWith("* "))
                        {
                            stepText = line.Substring(2).Trim();
                        }
                        else if (line.Length > 0 && char.IsDigit(line[0]))
                        {
                            int dotIndex = stepText.IndexOf('.');
                            if (dotIndex > 0 && dotIndex < 3)
                                stepText = stepText.Substring(dotIndex + 1).Trim();
                        }

                        if (!string.IsNullOrWhiteSpace(stepText))
                            stepLines.Add(stepText);
                    }

                    if (currentSection == 1 && !line.StartsWith("#") && !line.Contains("Tiempo:"))
                    {
                        if (string.IsNullOrEmpty(recipe.Description))
                            recipe.Description = line;
                    }
                }

                recipe.Ingredients = ParseIngredients(ingredientLines);
                recipe.Steps = stepLines;

                return recipe;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al parsear receta de texto.");
                return null;
            }
        }

        private void ExtractMetaInfo(string line, GeneratedRecipeDto recipe)
        {
            var timeMatch = Regex.Match(line, @"Tiempo:\s*(\d+)");
            if (timeMatch.Success && int.TryParse(timeMatch.Groups[1].Value, out var minutes))
                recipe.CookingTimeMinutes = minutes;

            var servingsMatch = Regex.Match(line, @"Porciones:\s*(\d+)");
            if (servingsMatch.Success && int.TryParse(servingsMatch.Groups[1].Value, out var servings))
                recipe.Servings = servings;
        }

        private List<GeneratedIngredientDto> ParseIngredients(List<string> ingredientLines)
        {
            var ingredients = new List<GeneratedIngredientDto>();

            foreach (var line in ingredientLines)
            {
                if (string.IsNullOrWhiteSpace(line))
                    continue;

                var normalizedLine = line.Replace("—", " - ").Replace("–", " - ");

                var parts = normalizedLine.Split(new[] { " - " }, StringSplitOptions.None);

                if (parts.Length >= 2)
                {
                    var name = parts[parts.Length - 1].Trim();
                    var quantityUnit = string.Join(" - ", parts.Take(parts.Length - 1)).Trim();

                    name = Regex.Replace(name, @"\s+", " ");

                    var ingredient = ParseQuantityAndUnit(quantityUnit, name);
                    if (!string.IsNullOrEmpty(ingredient.Name))
                        ingredients.Add(ingredient);
                }
                else if (parts.Length == 1)
                {
                    var name = parts[0].Trim();
                    name = Regex.Replace(name, @"\s+", " ");
                    if (!string.IsNullOrEmpty(name))
                    {
                        ingredients.Add(new GeneratedIngredientDto { Name = name, Quantity = "", Unit = "" });
                    }
                }
            }

            return ingredients;
        }

        private GeneratedIngredientDto ParseQuantityAndUnit(string quantityUnit, string name)
        {
            var ingredient = new GeneratedIngredientDto { Name = name, Quantity = "", Unit = "" };

            if (string.IsNullOrWhiteSpace(quantityUnit))
                return ingredient;

            quantityUnit = quantityUnit.Trim();
            name = name.Trim();

            if (quantityUnit.ToLower().StartsWith("a gusto") && name.ToLower().StartsWith("a gusto"))
            {
                if (name.ToLower().StartsWith("a gusto - "))
                    name = name.Substring("a gusto - ".Length).Trim();
                else if (name.ToLower().StartsWith("a gusto-"))
                    name = name.Substring("a gusto-".Length).Trim();
                else if (name.ToLower().StartsWith("a gusto"))
                    name = name.Substring("a gusto".Length).Trim();

                ingredient.Name = name;
                ingredient.Quantity = "a gusto";
                ingredient.Unit = "";
                return ingredient;
            }

            if (quantityUnit.ToLower().Contains("a gusto") || quantityUnit.ToLower().Contains("al gusto"))
            {
                ingredient.Quantity = "a gusto";
                ingredient.Unit = "";
                return ingredient;
            }

            var tokens = quantityUnit.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

            if (tokens.Length == 0)
                return ingredient;

            if (decimal.TryParse(tokens[0], out _))
            {
                ingredient.Quantity = tokens[0];
                if (tokens.Length > 1)
                    ingredient.Unit = string.Join(" ", tokens.Skip(1));
            }
            else
            {
                ingredient.Unit = quantityUnit;
            }

            return ingredient;
        }
    }
}
