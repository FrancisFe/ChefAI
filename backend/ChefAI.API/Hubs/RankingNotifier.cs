using ChefAI.Application.DTOs.Ranking;
using ChefAI.Application.Interfaces.Services;
using Microsoft.AspNetCore.SignalR;

namespace ChefAI.API.Hubs
{
    public class RankingNotifier : IRankingNotifier
    {
        private readonly IHubContext<RankingHub> _hubContext;
        private readonly ILogger<RankingNotifier> _logger;

        public RankingNotifier(
            IHubContext<RankingHub> hubContext,
            ILogger<RankingNotifier> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task RankingUpdatedAsync(
            int challengeId,
            IEnumerable<RankingEntryDto> ranking,
            CancellationToken cancellationToken = default)
        {
            try
            {
                await _hubContext.Clients
                    .Group($"challenge-{challengeId}")
                    .SendAsync(
                        "RankingUpdated",
                        ranking,
                        cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send ranking update for challenge {ChallengeId}", challengeId);
            }
        }
    }
}
