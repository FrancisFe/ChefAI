using ChefAI.Application.DTOs;
using ChefAI.Application.Interfaces.Services;
using Microsoft.AspNetCore.SignalR;

namespace ChefAI.API.Hubs
{
    public class NotificationNotifier : INotificationNotifier
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<NotificationNotifier> _logger;

        public NotificationNotifier(
            IHubContext<NotificationHub> hubContext,
            ILogger<NotificationNotifier> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task BadgeEarnedAsync(
            int userId,
            BadgeResult badge,
            CancellationToken cancellationToken = default)
        {
            try
            {
                await _hubContext.Clients
                    .Group(userId.ToString())
                    .SendAsync(
                        "BadgeEarned",
                        badge,
                        cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send BadgeEarned notification to user {UserId}", userId);
            }
        }
    }
}
