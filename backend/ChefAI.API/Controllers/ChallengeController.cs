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
        private readonly IVoteService _voteService;
        public ChallengeController(IChallengeService challengeService, IVoteService voteService)
        {
            _challengeService = challengeService;
            _voteService = voteService;
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
        [HttpGet]
        public async Task<IActionResult> GetAllChallenges()
        {
            var challenges = await _challengeService.GetAllAsync();
            return Ok(challenges);
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

        [Authorize]
        [HttpPost("entries/{entryId}/vote")]
        public async Task<IActionResult> Vote(int entryId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
                return Unauthorized("No user ID found in token");

            var (points, badges) = await _voteService.VoteAsync(userId, entryId);
            return Ok(new { points, badges });
        }

        [Authorize]
        [HttpDelete("entries/{entryId}/vote")]
        public async Task<IActionResult> RemoveVote(int entryId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
                return Unauthorized("No user ID found in token");

            var points = await _voteService.RemoveVoteAsync(userId, entryId);
            return Ok(new { points });
        }

        [Authorize]
        [HttpGet("{id}/feed")]
        public async Task<IActionResult> GetFeed(int id, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
                return Unauthorized("No user ID found in token");

            var feed = await _challengeService.GetFeedAsync(id, userId, page, pageSize);
            return Ok(feed);
        }

        [Authorize]
        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            var history = await _challengeService.GetHistoryAsync();
            return Ok(history);
        }
    }
}
