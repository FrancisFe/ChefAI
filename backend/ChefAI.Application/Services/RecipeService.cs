using ChefAI.Application.DTOs.Recipe;
using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Application.Interfaces.Services;
using Microsoft.Extensions.Logging;
using System.Runtime.CompilerServices;
using System.Text;

namespace ChefAI.Application.Services
{
    public class RecipeService : IRecipeService
    {
        private readonly IGeminiRecipeService _geminiService;
        private readonly IRecipeRepository _recipeRepository;
        private readonly IRecipeTextParser _textParser;
        private readonly IRecipePromptBuilder _promptBuilder;
        private readonly IRecipeMapper _mapper;
        private readonly ILogger<RecipeService> _logger;

        public RecipeService(
            IGeminiRecipeService geminiService,
            IRecipeRepository recipeRepository,
            IRecipeTextParser textParser,
            IRecipePromptBuilder promptBuilder,
            IRecipeMapper mapper,
            ILogger<RecipeService> logger)
        {
            _geminiService = geminiService;
            _recipeRepository = recipeRepository;
            _textParser = textParser;
            _promptBuilder = promptBuilder;
            _mapper = mapper;
            _logger = logger;
        }

        public async IAsyncEnumerable<string> GenerateRecipeAsync(
            RecipeRequestDto request,
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            var systemPrompt = _promptBuilder.BuildSystemPrompt();
            var userPrompt = _promptBuilder.BuildUserPrompt(request);

            _logger.LogInformation("Generando receta con ingredientes: {Ingredients}",
                string.Join(", ", request.Ingredients));

            var fullContent = new StringBuilder();

            await using var enumerator = _geminiService
                .GenerateContentAsync(systemPrompt, userPrompt, cancellationToken)
                .GetAsyncEnumerator(cancellationToken);

            while (!cancellationToken.IsCancellationRequested)
            {
                string chunk;

                try
                {
                    if (!await enumerator.MoveNextAsync())
                    {
                        _logger.LogInformation("Streaming completado normalmente");
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

                await Task.Delay(50, cancellationToken);
            }

            if (!cancellationToken.IsCancellationRequested)
            {
                await SaveGeneratedRecipeAsync(fullContent.ToString(), request, cancellationToken);
            }
        }

        private async Task SaveGeneratedRecipeAsync(
            string generatedText,
            RecipeRequestDto request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(generatedText))
            {
                _logger.LogWarning("La IA no devolvió contenido para la receta.");
                return;
            }

            var generated = _textParser.ParseRecipeFromText(generatedText);

            if (generated is null)
            {
                _logger.LogError("No se pudo parsear la receta generada. Texto:\n{GeneratedText}",
                    generatedText.Substring(0, Math.Min(500, generatedText.Length)));
                return;
            }

            _logger.LogInformation(
                "Receta parseada: {Title} - {IngredientCount} ingredientes, {StepCount} pasos",
                generated.Title,
                generated.Ingredients.Count,
                generated.Steps.Count);

            var recipe = _mapper.MapToRecipeEntity(generated, request);

            try
            {
                await _recipeRepository.SaveAsync(recipe, cancellationToken);
                _logger.LogInformation("Receta '{Title}' guardada exitosamente para usuario {UserId}",
                    recipe.Title, request.UserId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al guardar la receta en la BD");
                throw;
            }
        }

        public async Task<List<AllRecipesByUserIdDto>> GetAllRecipesByUserId(int userId)
        {
            _logger.LogInformation("Obteniendo recetas para usuario {UserId}", userId);

            var recipes = await _recipeRepository.GetAllRecipesByUserId(userId);

            var result = recipes.Select(r => new AllRecipesByUserIdDto
            {
                Title = r.Title,
                Description = r.Description,
                CookingTime = r.CookingTime,
                Servings = r.Servings,
                IsFavorite = r.IsFavorite,
                Ingredients = r.Ingredients
                    .Select(i => new AllRecipeIngredientDto
                    {
                        Name = i.Name,
                        Quantity = i.Quantity,
                        Unit = i.Unit
                    })
                    .ToList()
            }).ToList();

            _logger.LogInformation("Se obtuvieron {Count} recetas para usuario {UserId}",
                result.Count, userId);

            return result;
        }
    }
}