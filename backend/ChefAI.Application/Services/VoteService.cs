using ChefAI.Application.DTOs;
using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Application.Interfaces.Services;
using ChefAI.Domain.Entities;
using ChefAI.Domain.Enums;

namespace ChefAI.Application.Services
{
    public class VoteService : IVoteService
    {
        private readonly IVoteRepository _voteRepository;
        private readonly IChallengeEntryRepository _challengeEntryRepository;
        private readonly IGamificacionService _gamificacionService;

        public VoteService(
            IVoteRepository voteRepository,
            IChallengeEntryRepository challengeEntryRepository,
            IGamificacionService gamificacionService)
        {
            _voteRepository = voteRepository;
            _challengeEntryRepository = challengeEntryRepository;
            _gamificacionService = gamificacionService;
        }

        public async Task<(PointsResult Points, List<BadgeResult> Badges)> VoteAsync(int userId, int challengeEntryId)
        {
            var entry = await _challengeEntryRepository.GetByIdAsync(challengeEntryId);
            if (entry == null)
                throw new KeyNotFoundException("No se encontró la entrada del desafío.");

            if (entry.Challenge.Status != ChallengeStatus.Active)
                throw new InvalidOperationException("El desafío no está activo.");

            if (entry.UserId == userId)
                throw new InvalidOperationException("No podés votar tu propia entrada.");

            var existingVote = await _voteRepository.GetByUserAndEntryAsync(userId, challengeEntryId);
            if (existingVote != null)
                throw new InvalidOperationException("Ya votaste esta entrada.");

            var vote = new Vote
            {
                UserId = userId,
                ChallengeEntryId = challengeEntryId,
                CreatedAt = DateTime.UtcNow
            };

            await _voteRepository.AddAsync(vote);
            entry.VoteCount++;
            await _challengeEntryRepository.SaveChangesAsync();

            var points = await _gamificacionService.AddPoints(entry.UserId, GamificationAction.ReceiveVote);
            var badges = await _gamificacionService.EvaluateBadges(entry.UserId);

            return (points, badges);
        }

        public async Task<PointsResult> RemoveVoteAsync(int userId, int challengeEntryId)
        {
            var vote = await _voteRepository.GetByUserAndEntryAsync(userId, challengeEntryId);
            if (vote == null)
                throw new KeyNotFoundException("No se encontró tu voto en esta entrada.");

            var entry = await _challengeEntryRepository.GetByIdAsync(challengeEntryId);
            if (entry == null)
                throw new KeyNotFoundException("No se encontró la entrada del desafío.");

            if (entry.Challenge.Status != ChallengeStatus.Active)
                throw new InvalidOperationException("El desafío no está activo.");

            await _voteRepository.RemoveAsync(vote);
            entry.VoteCount = Math.Max(0, entry.VoteCount - 1);
            await _challengeEntryRepository.SaveChangesAsync();

            var points = await _gamificacionService.DeductPoints(entry.UserId, 2);

            return points;
        }
    }
}