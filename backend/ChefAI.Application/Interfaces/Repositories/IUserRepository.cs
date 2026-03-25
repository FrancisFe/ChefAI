using ChefAI.Domain.Entities;
using ChefAI.Domain.Enums;

namespace ChefAI.Application.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<bool> EmailExistAsync(string email);
        Task<User> AddAsync(User user);
        Task<User> UpdateAsync(User user);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByRefreshTokenAsync(string refreshToken);
        Task<UserRole?> GetUserRoleAsync(int userId);
    }

}
