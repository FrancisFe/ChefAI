using ChefAI.Application.DTOs.Auth;
using ChefAI.Application.DTOs.User;
using ChefAI.Domain.Enums;

namespace ChefAI.Application.Interfaces.Services
{
    public interface IAuthService
    {
        Task<UserDto?> RegisterAsync(RegisterDto request);
        Task<TokenResponseDto?> LoginAsync(LoginDto request);
        Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenDto request);
        Task<bool> LogoutAsync(int userId);
        Task<UserRole?> GetUserRoleAsync(int userId);
    }
}
