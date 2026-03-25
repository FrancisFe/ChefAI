using ChefAI.Application.DTOs.Auth;
using ChefAI.Application.DTOs.User;
using ChefAI.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChefAI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<ActionResult<TokenResponseDto>> Login([FromBody] LoginDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var token = await _authService.LoginAsync(request);
            return Ok(token);
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register([FromBody] RegisterDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _authService.RegisterAsync(request);

            if (user == null)
            {
                _logger.LogWarning("Registration attempt with existing email: {Email}", request.Email);
                return BadRequest(new { message = "El email ya existe" });
            }

            _logger.LogInformation("User registered successfully: {Email}", user.Email);
            return Ok(user);
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<TokenResponseDto>> RefreshToken([FromBody] RefreshTokenDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var token = await _authService.RefreshTokenAsync(request);
            return Ok(token);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<ActionResult<bool>> Logout()
        {
            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                _logger.LogWarning("Logout attempt with invalid user ID");
                return BadRequest(new { message = "No se pudo obtener el ID del usuario" });
            }

            var result = await _authService.LogoutAsync(userId);
            return Ok(new { success = result });
        }

        [HttpGet("is-admin")]
        [Authorize]
        public ActionResult<bool> IsAdmin()
        {
            return Ok(User.IsInRole("Admin"));
        }
    }
}
