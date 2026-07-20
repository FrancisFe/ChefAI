using ChefAI.Application.DTOs;

namespace ChefAI.Application.Interfaces.Services
{
    public interface INotificationNotifier
    {
        Task BadgeEarnedAsync(
        int userId,
        BadgeResult badge,
        CancellationToken cancellationToken = default);
    }
}
