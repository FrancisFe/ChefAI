using ChefAI.Application.DTOs.Recipe;
using ChefAI.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ChefAI.API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class RecipeController : ControllerBase
    {
        private readonly IRecipeService _recipeService;
        private readonly ILogger<RecipeController> _logger;

        public RecipeController(IRecipeService recipeService, ILogger<RecipeController> logger)
        {
            _recipeService = recipeService;
            _logger = logger;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateRecipe(
            [FromBody] RecipeRequestDto request,
            CancellationToken cancellationToken)
        {
            if (request is null || request.Ingredients is null || request.Ingredients.Count == 0)
            {
                return BadRequest(new { message = "Debe enviar al menos un ingrediente." });
            }

            Response.ContentType = "text/event-stream";
            Response.Headers.CacheControl = "no-cache";

            var feature = HttpContext.Features.Get<Microsoft.AspNetCore.Http.Features.IHttpResponseBodyFeature>();
            feature?.DisableBuffering();

            try
            {
                await foreach (var chunk in _recipeService
                    .GenerateRecipeAsync(request, cancellationToken)
                    .WithCancellation(cancellationToken))
                {
                    await Response.WriteAsync($"data: {EscapeSse(chunk)}\n\n", cancellationToken);
                    await Response.Body.FlushAsync(cancellationToken);
                }

            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Streaming de receta cancelado por el cliente.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante el streaming de receta.");

                if (!Response.HasStarted)
                {
                    throw;
                }

                await Response.WriteAsync("event: error\n", cancellationToken);
                await Response.WriteAsync("data: Error durante la generación de la receta\n\n", cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);
            }

            return new EmptyResult();
        }

        [HttpGet("user/history")]
        public async Task<IActionResult> GetUserRecipeHistory([FromQuery] bool favoritesOnly = false)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            if (userId == 0)
                return Unauthorized("No user ID found in token");

            var recipes = await _recipeService.GetUserRecipeHistory(userId , favoritesOnly);
            return Ok(recipes);
        }

        [HttpPost("{recipeId}/favorite")]
        public async Task<IActionResult> AddFavorite(int recipeId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _recipeService.AddFavorite(recipeId, userId);
            return NoContent();
        }
        [HttpDelete("{recipeId}/favorite")]
        public async Task<IActionResult> RemoveFavorite(int recipeId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _recipeService.RemoveFavorite(recipeId, userId);
            return NoContent();
        }
        private static string EscapeSse(string value) => value
            .Replace("\r\n", "\\n")
            .Replace("\n", "\\n")
            .Replace("\r", "\\n");
    }
}
