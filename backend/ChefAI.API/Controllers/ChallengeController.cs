using ChefAI.Application.DTOs;
using ChefAI.Application.DTOs.Challenge;
using ChefAI.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ChefAI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChallengeController : ControllerBase
    {
        private readonly IChallengeService _challengeService;
        public ChallengeController(IChallengeService challengeService)
        {
            _challengeService = challengeService;
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateChallenge([FromBody] CreateChallengeRequest request)
        {
            var result = await _challengeService.CreateAsync(request);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{challengeId}/activate")]
        public async Task<IActionResult> ActivateChallenge(int challengeId)
        {
            await _challengeService.ActivateAsync(challengeId);
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{challengeId}/close")]
        public async Task<IActionResult> CloseChallenge(int challengeId)
        {
            await _challengeService.CloseAsync(challengeId);
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("ingredients")]
        public async Task<IActionResult> GetAvailableIngredients()
        {
            var ingredients = await _challengeService.GetAvailableIngredientsAsync();
            return Ok(ingredients);
        }

        [Authorize]
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveChallenge()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var challenge = await _challengeService.GetActiveChallengeAsync(userId);
            if (challenge == null)
                return NotFound();
            return Ok(challenge);
        }

        [Authorize]
        [HttpPost("{challengeId}/participate")]
        public async Task<IActionResult> Participate(int challengeId, [FromBody] ParticipateRequestDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
                return Unauthorized("No user ID found in token");

            var result = await _challengeService.ParticipateAsync(challengeId, request.RecipeId, userId);
            return Ok(result);
        }
    }
}
