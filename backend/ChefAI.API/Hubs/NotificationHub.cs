using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ChefAI.API.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            if(Context.UserIdentifier is not null)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, Context.UserIdentifier);

            }
            await base.OnConnectedAsync();
        }

    }
}
