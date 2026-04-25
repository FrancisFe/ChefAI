using ChefAI.Application.DTOs.Auth;
using ChefAI.Application.Interfaces.Services;
using ChefAI.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ChefAI.Infraestructure.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<TokenService> _logger;

        public TokenService(IConfiguration configuration, ILogger<TokenService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public TokenResponseDto CreateToken(User user)
        {
            if (user == null)
            {
                _logger.LogError("Attempted to create token for null user");
                throw new ArgumentNullException(nameof(user), "User cannot be null");
            }

            if (!user.IsActive)
            {
                _logger.LogError("Attempted to create token for inactive user {UserId}", user.Id);
                throw new InvalidOperationException("User is not active");
            }

            try
            {
                var tokenSecret = _configuration["AppSettings:Token"];
                var issuer = _configuration["AppSettings:Issuer"];
                var audience = _configuration["AppSettings:Audience"];

                if (string.IsNullOrEmpty(tokenSecret))
                {
                    _logger.LogError("AppSettings:Token is not configured");
                    throw new InvalidOperationException("Token secret is not configured");
                }

                if (tokenSecret.Length < 64)
                {
                    _logger.LogError("AppSettings:Token is too short. Required: 64+ characters, Current: {Length}", tokenSecret.Length);
                    throw new InvalidOperationException($"Token secret must be at least 64 characters for HmacSha512. Current length: {tokenSecret.Length}");
                }

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role.ToString()),
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenSecret));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

                var tokenDescriptor = new JwtSecurityToken(
                    issuer: issuer,
                    audience: audience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddDays(1),
                    signingCredentials: creds);

                var token = new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);

                _logger.LogInformation("Token created successfully for user {UserId}", user.Id);
                _logger.LogDebug("Token claims: {Claims}", string.Join(", ", claims.Select(c => $"{c.Type}={c.Value}")));

                return new TokenResponseDto
                {
                    Token = token,
                    ExpiresAt = tokenDescriptor.ValidTo
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating token for user {UserId}", user.Id);
                throw;
            }
        }
    }
}
