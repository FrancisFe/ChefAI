using ChefAI.Application.DTOs.Recipe;
using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Application.Interfaces.Services;
using ChefAI.Domain.Entities;
using Microsoft.Extensions.Logging;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;

namespace ChefAI.Application.Services
{
    public class RecipeService : IRecipeService
    {
        private readonly IGeminiRecipeService _geminiService;
        private readonly IRecipeRepository _recipeRepository;
        private readonly ILogger<RecipeService> _logger;

        public RecipeService(
            IGeminiRecipeService geminiService,
            IRecipeRepository recipeRepository,
            ILogger<RecipeService> logger)
        {
            _geminiService = geminiService;
            _recipeRepository = recipeRepository;
            _logger = logger;
        }

        public async IAsyncEnumerable<string> GenerateRecipeAsync(
            RecipeRequestDto request,
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            var prompt = BuildPrompt(request);
            var fullContent = new StringBuilder();

            await using var enumerator = _geminiService
                .GenerateContentAsync(prompt, cancellationToken)
                .GetAsyncEnumerator(cancellationToken);

            while (!cancellationToken.IsCancellationRequested)
            {
                string chunk;

                try
                {
                    if (!await enumerator.MoveNextAsync())
                    {
                        break;
                    }

                    chunk = enumerator.Current;
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("La generación de receta fue cancelada por el usuario.");
                    yield break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error durante el streaming de generación de receta.");
                    throw new InvalidOperationException("No fue posible generar la receta en este momento.", ex);
                }

                fullContent.Append(chunk);
                yield return chunk;
            }

            if (!cancellationToken.IsCancellationRequested)
            {
                await SaveGeneratedRecipeAsync(fullContent.ToString(), request, cancellationToken);
            }
        }

        private async Task SaveGeneratedRecipeAsync(
            string generatedJson,
            RecipeRequestDto request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(generatedJson))
            {
                _logger.LogWarning("La IA no devolvió contenido para deserializar la receta.");
                return;
            }

            var cleanedJson = CleanJsonResponse(generatedJson);
            var generated = DeserializeRecipe(cleanedJson);

            if (generated is null)
            {
                _logger.LogError("No se pudo deserializar la receta generada.");
                return;
            }

            var recipe = MapToRecipeEntity(generated, request);
            await _recipeRepository.SaveAsync(recipe, cancellationToken);
        }

        private string CleanJsonResponse(string json)
        {
            var cleaned = json
                .Replace("data:", string.Empty)
                .Replace("[DONE]", string.Empty)
                .Replace("```json", string.Empty)
                .Replace("```", string.Empty)
                .Trim();
            return cleaned;
        }

        private GeneratedRecipeDto? DeserializeRecipe(string json)
        {
            try
            {
                return JsonSerializer.Deserialize<GeneratedRecipeDto>(
                    json,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Error al deserializar JSON de receta.");
                return null;
            }
        }

        private Recipe MapToRecipeEntity(GeneratedRecipeDto generated, RecipeRequestDto request)
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
                        Quantity = decimal.TryParse(i.Quantity, out var q) ? q : 0
                    })
                    .ToList(),
                Steps = string.Join("\n", generated.Steps ?? new List<string>())
            };
        }

        private static string BuildPrompt(RecipeRequestDto request)
        {
            var sb = new StringBuilder();

            sb.AppendLine("Generate a recipe in JSON format.");
            sb.AppendLine("Respond ONLY in Spanish.");
            sb.AppendLine("Return ONLY valid JSON. Do not include explanations or extra text.");
            sb.AppendLine("Include clear, detailed, step-by-step cooking instructions.");
            sb.AppendLine("Use realistic seasoning. Include salt, pepper, and optional spices 'to taste' instead of only salt.");
            sb.AppendLine("Ingredients must include condiments like salt, pepper, and spices when appropriate.");
            sb.AppendLine("Use 'a gusto' for seasoning quantities.");
            sb.AppendLine("Steps must be ordered and easy to follow.");
            sb.AppendLine(
                """
                {
                  "title": "",
                  "description": "",
                  "cookingTimeMinutes": 0,
                  "servings": 0,
                  "ingredients": [
                    {
                      "name": "",
                      "quantity": ""
                    }
                  ],
                  "steps": [
                    "Paso 1...",
                    "Paso 2..."
                  ]
                }
                """);

            sb.AppendLine("Ingredients available:");
            sb.AppendLine(string.Join(", ", request.Ingredients));

            if (request.Servings.HasValue)
            {
                sb.AppendLine($"Servings: {request.Servings}");
            }

            if (request.MaxCookingTimeMinutes.HasValue)
            {
                sb.AppendLine($"Max cooking time: {request.MaxCookingTimeMinutes} minutes");
            }

            if (!string.IsNullOrWhiteSpace(request.Difficulty))
            {
                sb.AppendLine($"Difficulty: {request.Difficulty}");
            }

            sb.AppendLine("Start writing immediately in a streaming fashion.");

            return sb.ToString();
        }
    }
}
