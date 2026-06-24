using ChefAI.Application.DTOs;
using ChefAI.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ChefAI.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class GamificationController : ControllerBase
{
    private readonly IGamificacionService _gamificacionService;

    public GamificationController(IGamificacionService gamificacionService)
    {
        _gamificacionService = gamificacionService;
    }

    [HttpGet("points")]
    public async Task<ActionResult<PointsDto>> GetPoints()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        if (userId == 0)
            return Unauthorized();

        var result = await _gamificacionService.GetUserPointsAsync(userId);
        return Ok(result);
    }

    [HttpGet("badges")]
    public async Task<ActionResult<List<BadgeStatusDto>>> GetBadges()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        if (userId == 0)
            return Unauthorized();

        var result = await _gamificacionService.GetUserBadgesWithStatusAsync(userId);
        return Ok(result);
    }
}
