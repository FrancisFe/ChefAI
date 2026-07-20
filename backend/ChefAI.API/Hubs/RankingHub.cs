using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ChefAI.API.Hubs
{
    [Authorize]
    public class RankingHub : Hub
    {

        public async Task JoinChallenge(string challengeId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"challenge-{challengeId}");
        }

        public async Task LeaveChallenge(string challengeId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"challenge-{challengeId}");
        }
    }
}
