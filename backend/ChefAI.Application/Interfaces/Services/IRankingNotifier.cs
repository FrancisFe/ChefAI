using ChefAI.Application.DTOs.Ranking;
namespace ChefAI.Application.Interfaces.Services
{
    public interface IRankingNotifier
    {
        Task RankingUpdatedAsync(
        int challengeId,
        IEnumerable<RankingEntryDto> ranking,
        CancellationToken cancellationToken = default);
    }
}