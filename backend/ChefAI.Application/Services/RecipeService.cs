using ChefAI.Application.DTOs;
using ChefAI.Application.DTOs.Recipe;
using ChefAI.Application.Helpers;
using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Application.Interfaces.Services;
using ChefAI.Application.Mappers;
using ChefAI.Domain.Entities;
using ChefAI.Domain.Enums;
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
        private readonly IRecipeTextParser _textParser;
        private readonly IRecipePromptBuilder _promptBuilder;
        private readonly IRecipeMapper _mapper;
        private readonly IUserProfileRepository _userProfileRepository;
        private readonly IGamificacionService _gamificacionService;
        private readonly ILogger<RecipeService> _logger;

        public RecipeService(
            IGeminiRecipeService geminiService,
            IRecipeRepository recipeRepository,
            IRecipeTextParser textParser,
            IRecipePromptBuilder promptBuilder,
            IRecipeMapper mapper,
            IUserProfileRepository userProfileRepository,
            IGamificacionService gamificacionService,
            ILogger<RecipeService> logger)
        {
            _geminiService = geminiService;
            _recipeRepository = recipeRepository;
            _textParser = textParser;
            _promptBuilder = promptBuilder;
            _mapper = mapper;
            _userProfileRepository = userProfileRepository;
            _gamificacionService = gamificacionService;
            _logger = logger;
        }

        public async IAsyncEnumerable<string> GenerateRecipeAsync(
            RecipeRequestDto request,
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            var userProfile = await _userProfileRepository.GetByUserIdAsync(request.UserId);
            var systemPrompt = _promptBuilder.BuildSystemPrompt();
            var userPrompt = _promptBuilder.BuildUserPrompt(request, userProfile?.DietaryRestrictions ?? []);

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
                var savedRecipe = await SaveGeneratedRecipeAsync(fullContent.ToString(), request, cancellationToken);

                var pointsResult = await _gamificacionService.AddPoints(request.UserId, GamificationAction.GenerateRecipe);
                await _gamificacionService.UpdateStreak(request.UserId);
                var badges = await _gamificacionService.EvaluateBadges(request.UserId);

                yield return "[DONE]";

                var previousTotal = pointsResult.TotalPoints - pointsResult.PointsEarned;
                var leveledUp = previousTotal / 50 < pointsResult.CurrentLevel;

                var gamificationPayload = new
                {
                    pointsEarned = pointsResult.PointsEarned,
                    totalPoints = pointsResult.TotalPoints,
                    currentLevel = pointsResult.CurrentLevel,
                    leveledUp,
                    recipeId = savedRecipe?.Id,
                    badges = badges.Select(b => new
                    {
                        badgeUnlocked = b.BadgeUnlocked,
                        badgeName = b.BadgeName,
                        badgeIcon = b.BadgeIcon
                    })
                };

                yield return JsonSerializer.Serialize(gamificationPayload);
            }
        }

        private async Task<Recipe?> SaveGeneratedRecipeAsync(
            string generatedText,
            RecipeRequestDto request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(generatedText))
            {
                _logger.LogWarning("La IA no devolvió contenido para la receta.");
                return null;
            }

            var generated = _textParser.ParseRecipeFromText(generatedText);

            if (generated is null)
            {
                _logger.LogError("No se pudo parsear la receta generada. Texto:\n{GeneratedText}",
                    generatedText.Substring(0, Math.Min(500, generatedText.Length)));
                return null;
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
                return recipe;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al guardar la receta en la BD");
                throw;
            }
        }

        public async Task<List<AllRecipesByUserIdDto>> GetUserRecipeHistory(int userId , bool favoritesOnly)
        {
            _logger.LogInformation("Obteniendo recetas para usuario {UserId}", userId);

            var recipes = await _recipeRepository.GetAllRecipesByUserId(userId , favoritesOnly);

            var result = recipes.Select(r => new AllRecipesByUserIdDto
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                CookingTime = r.CookingTime,
                Servings = r.Servings,
                IsFavorite = r.IsFavorite,
                CreatedAt = r.CreatedAt,
                Steps = r.Steps,
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

        public async Task<AllRecipesByUserIdDto?> GetRecipeByIdAsync(int recipeId)
        {
            var recipe = await _recipeRepository.GetByIdAsync(recipeId);
            if (recipe == null) return null;

            return new AllRecipesByUserIdDto
            {
                Id = recipe.Id,
                Title = recipe.Title,
                Description = recipe.Description,
                CookingTime = recipe.CookingTime,
                Servings = recipe.Servings,
                IsFavorite = recipe.IsFavorite,
                CreatedAt = recipe.CreatedAt,
                Steps = recipe.Steps,
                Ingredients = recipe.Ingredients
                    .Select(i => new AllRecipeIngredientDto
                    {
                        Name = i.Name,
                        Quantity = i.Quantity,
                        Unit = i.Unit
                    })
                    .ToList()
            };
        }

        public async Task AddFavorite(int recipeId, int userId)
        {
            var recipe = await _recipeRepository.GetByIdAsync(recipeId);
            if (recipe == null)
            {
                _logger.LogWarning("No se encontró la receta con ID {RecipeId} para marcar como favorita", recipeId);
                throw new KeyNotFoundException($"Recipe {recipeId} not found");
            }
            if (recipe.UserId != userId)
            {
                _logger.LogWarning("El usuario {UserId} intentó marcar como favorita una receta que no le pertenece (ID {RecipeId})", userId, recipeId);
                throw new UnauthorizedAccessException(
            $"User {userId} does not own recipe {recipeId}");
            }
            if (recipe.IsFavorite)
            {
                _logger.LogInformation("Receta {RecipeId} ya estaba marcada como favorita", recipeId);
                return;
            }

            recipe.IsFavorite = true;

            if (!recipe.HasAwardedFavoritePoints)
            {
                await _gamificacionService.AddPoints(userId, GamificationAction.MarkFavorite);
                await _gamificacionService.EvaluateBadges(userId);
                recipe.HasAwardedFavoritePoints = true;
            }

            await _recipeRepository.SaveChangesAsync();

            _logger.LogInformation(
       "Receta {RecipeId} marcada como favorita por usuario {UserId}",
       recipeId,
       userId);
        }


        public async Task RemoveFavorite(int recipeId, int userId)
        {
            var recipe = await _recipeRepository.GetByIdAsync(recipeId);
            if (recipe == null)
            {
                _logger.LogWarning("No se encontró la receta con ID {RecipeId} para desmarcar como favorita", recipeId);
                throw new KeyNotFoundException($"Recipe {recipeId} not found");
            }
            if (recipe.UserId != userId)
            {
                _logger.LogWarning("El usuario {UserId} intentó desmarcar como favorita una receta que no le pertenece (ID {RecipeId})", userId, recipeId);
                throw new UnauthorizedAccessException(
            $"User {userId} does not own recipe {recipeId}");
            }
            recipe.IsFavorite = false;
            await _recipeRepository.SaveChangesAsync();
            _logger.LogInformation(
    "Receta {RecipeId} desmarcada como favorita por usuario {UserId}",
    recipeId,
    userId);
        }
    }
}