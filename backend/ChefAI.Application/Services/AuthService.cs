using ChefAI.Application.DTOs.Auth;
using ChefAI.Application.DTOs.User;
using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Application.Interfaces.Services;
using ChefAI.Domain.Entities;
using ChefAI.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;

namespace ChefAI.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<AuthService> _logger;
        private readonly ITokenService _tokenService;
        public AuthService(
           IUserRepository userRepository,
           ILogger<AuthService> logger, ITokenService tokenService)
        {
            _userRepository = userRepository;
            _logger = logger;
            _tokenService = tokenService;
        }
        public async Task<TokenResponseDto?> LoginAsync(LoginDto request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                _logger.LogWarning("Login attempt with empty email or password");
                throw new Exception("Invalid credentials");
            }

            var email = request.Email.Trim().ToLower();

            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                _logger.LogWarning("Failed login attempt");
                throw new Exception("Invalid credentials");
            }

            if (!user.IsActive)
            {
                throw new Exception("User is inactive");
            }

            var passwordHasher = new PasswordHasher<User>();
            var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

            if (result == PasswordVerificationResult.Failed)
            {
                _logger.LogWarning("Failed login attempt");
                throw new Exception("Invalid credentials");
            }

            if (user.TokenExpires.HasValue && user.TokenExpires < DateTimeOffset.UtcNow)
            {
                user.RefreshToken = null;
                user.TokenExpires = null;
            }

            user.RefreshToken = GenerateRefreshToken();
            user.TokenExpires = DateTimeOffset.UtcNow.AddDays(7);
            if (result == PasswordVerificationResult.SuccessRehashNeeded)
            {
                user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
            }

            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("User {UserId} logged in successfully", user.Id);
            var tokenResponse = _tokenService.CreateToken(user);
            tokenResponse.RefreshToken = user.RefreshToken;
            return tokenResponse;
        }

        public async Task<UserDto?> RegisterAsync(RegisterDto request)
        {
            var email = request.Email.Trim().ToLower();
            if (await _userRepository.EmailExistAsync(email))
            {
                _logger.LogWarning("Registration attempt with existing email or username");
                return null;
            }

            var hasher = new PasswordHasher<User>();

            var user = new User
            {
                Email = request.Email.Trim().ToLower(),
                CreatedAt = DateTime.UtcNow,
                Role = UserRole.User,
                IsActive = true
            };
            user.PasswordHash = hasher.HashPassword(user, request.Password);

            await _userRepository.AddAsync(user);
            _logger.LogInformation("User {Email} registered successfully", user.Email);
            return new UserDto
            {
                Email = user.Email,
                Role = user.Role
            };

        }
        public async Task<UserRole?> GetUserRoleAsync(int userId)
        {
            return await _userRepository.GetUserRoleAsync(userId);
        }

        public async Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenDto request)
        {
            if (string.IsNullOrEmpty(request.RefreshToken))
            {
                _logger.LogWarning("Refresh token attempt with empty token");
                throw new InvalidOperationException("Refresh token is required");
            }

            var user = await _userRepository.GetByRefreshTokenAsync(request.RefreshToken);
            if (user == null)
            {
                _logger.LogWarning("Refresh token attempt with invalid token");
                throw new UnauthorizedAccessException("Invalid refresh token");
            }

            if (!user.IsActive)
            {
                _logger.LogWarning("Refresh token attempt for inactive user {UserId}", user.Id);
                throw new InvalidOperationException("User is not active");
            }

            if (user.TokenExpires < DateTimeOffset.UtcNow)
            {
                _logger.LogWarning("Refresh token expired for user {UserId}", user.Id);
                user.RefreshToken = null;
                user.TokenExpires = null;
                await _userRepository.UpdateAsync(user);
                throw new UnauthorizedAccessException("Refresh token has expired");
            }

            var tokenResponse = _tokenService.CreateToken(user);
            user.RefreshToken = GenerateRefreshToken();
            user.TokenExpires = DateTimeOffset.UtcNow.AddDays(7);

            await _userRepository.UpdateAsync(user);
            _logger.LogInformation("Token refreshed for user {UserId}", user.Id);

            tokenResponse.RefreshToken = user.RefreshToken;
            return tokenResponse;
        }

        public async Task<bool> LogoutAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("Logout attempt for non-existent user {UserId}", userId);
                return false;
            }

            user.RefreshToken = null;
            user.TokenExpires = null;

            await _userRepository.UpdateAsync(user);
            _logger.LogInformation("User {UserId} logged out successfully", userId);
            return true;
        }

        private string GenerateRefreshToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        }
    }
}
