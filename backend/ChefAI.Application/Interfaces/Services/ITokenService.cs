using ChefAI.Application.DTOs.Auth;
using ChefAI.Domain.Entities;

namespace ChefAI.Application.Interfaces.Services
{
    public interface ITokenService
    {
        TokenResponseDto CreateToken(User user);
    }
}
