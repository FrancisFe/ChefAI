using ChefAI.Application.DTOs;
using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Application.Interfaces.Services;
using ChefAI.Domain.Entities;
using ChefAI.Domain.Enums;

namespace ChefAI.Application.Services
{
    public class GamificacionService : IGamificacionService
    {
        private readonly IUserPointsRepository _userPointsRepository;
        private readonly IBadgeRepository _badgeRepository;
        private readonly IRecipeRepository _recipeRepository;
        private readonly IChallengeEntryRepository _challengeEntryRepository;
        private readonly IUserProfileRepository _userProfileRepository;
        private readonly INotificationNotifier _notificationNotifier;

        public GamificacionService(
            IUserPointsRepository userPointsRepository,
            IBadgeRepository badgeRepository,
            IRecipeRepository recipeRepository,
            IChallengeEntryRepository challengeEntryRepository,
            IUserProfileRepository userProfileRepository,
            INotificationNotifier notificationNotifier)
        {
            _userPointsRepository = userPointsRepository;
            _badgeRepository = badgeRepository;
            _recipeRepository = recipeRepository;
            _challengeEntryRepository = challengeEntryRepository;
            _userProfileRepository = userProfileRepository;
            _notificationNotifier = notificationNotifier;
        }

        public async Task<PointsResult> AddPoints(int userId, GamificationAction action)
        {
            var userPoints = await _userPointsRepository.GetByUserIdAsync(userId);
            if (userPoints == null)
            {
                throw new Exception("User points record not found.");
            }
            userPoints.TotalPoints += (int)action;
            await _userPointsRepository.UpdateAsync(userPoints);
            return new PointsResult((int)action, userPoints.TotalPoints, CalculateLevel(userPoints.TotalPoints));
        }

        public async Task<PointsResult> DeductPoints(int userId, int points)
        {
            var userPoints = await _userPointsRepository.GetByUserIdAsync(userId);
            if (userPoints == null)
            {
                throw new Exception("User points record not found.");
            }
            userPoints.TotalPoints = Math.Max(0, userPoints.TotalPoints - points);
            await _userPointsRepository.UpdateAsync(userPoints);
            return new PointsResult(-points, userPoints.TotalPoints, CalculateLevel(userPoints.TotalPoints));
        }

        public async Task<List<BadgeResult>> EvaluateBadges(int userId)
        {
            var allBadges = await _badgeRepository.GetAllAsync();
            var ownedBadgeIds = (await _badgeRepository.GetUserBadgesAsync(userId))
                .Select(ub => ub.BadgeId)
                .ToHashSet();

            var recipes = await _recipeRepository.GetAllRecipesByUserId(userId, false);
            var totalRecipes = recipes.Count;
            var totalFavorites = recipes.Count(r => r.IsFavorite);

            var userPoints = await _userPointsRepository.GetByUserIdAsync(userId);
            var currentStreak = userPoints?.UserStreak ?? 0;

            var hasParticipated = await _challengeEntryRepository.UserHasParticipatedAsync(userId);
            var totalVotes = await _challengeEntryRepository.GetTotalVotesReceivedAsync(userId);

            var userProfile = await _userProfileRepository.GetByUserIdAsync(userId);
            var hasUsedPhotoDetection = userProfile?.HasUsedPhotoDetection ?? false;

            var newlyEarned = new List<UserBadge>();
            var results = new List<BadgeResult>();

            foreach (var badge in allBadges)
            {
                if (ownedBadgeIds.Contains(badge.Id))
                    continue;

                bool unlocked = badge.Condition switch
                {
                    "TotalRecipes" => totalRecipes >= (badge.ConditionValue ?? 1),
                    "CurrentStreak" => currentStreak >= (badge.ConditionValue ?? 1),
                    "TotalFavorites" => totalFavorites >= (badge.ConditionValue ?? 1),
                    "TotalVotesReceived" => totalVotes >= (badge.ConditionValue ?? 1),
                    "HasParticipatedInChallenge" => hasParticipated,
                    "HasUsedPhotoDetection" => hasUsedPhotoDetection,
                    _ => false
                };

                if (unlocked)
                {
                    newlyEarned.Add(new UserBadge
                    {
                        UserId = userId,
                        BadgeId = badge.Id,
                        EarnedAt = DateTimeOffset.UtcNow
                    });
                    var badgeResult = new BadgeResult(true, badge.Name, badge.IconUrl);
                    results.Add(badgeResult);
                    await _notificationNotifier.BadgeEarnedAsync(userId, badgeResult);
                }
               
            }

            if (newlyEarned.Count > 0)
            {
                await _badgeRepository.AddUserBadgesAsync(newlyEarned);
            }
            return results;
        }

        public async Task<StreakResult> UpdateStreak(int userId)
        {
            var userPoints = await _userPointsRepository.GetByUserIdAsync(userId);
            if (userPoints == null)
            {
                throw new Exception("User points record not found.");
            }
            var today = DateTimeOffset.UtcNow.Date;
            var lastActivityDate = userPoints.LastActivityDate.Date;
            var yesterday = today.AddDays(-1);

            bool isStreakIncreased = false;

            if (lastActivityDate == today)
            {
                isStreakIncreased = false;
            }
            if (lastActivityDate == yesterday)
            {
                userPoints.UserStreak += 1;
                isStreakIncreased = true;
            }
            else if (lastActivityDate < yesterday)
            {
                userPoints.UserStreak = 1;
            }

            userPoints.LastActivityDate = today;
            await _userPointsRepository.UpdateAsync(userPoints);
            return new StreakResult(userPoints.UserStreak, isStreakIncreased);
        }

        public async Task<PointsDto> GetUserPointsAsync(int userId)
        {
            var userPoints = await _userPointsRepository.GetByUserIdAsync(userId);
            if (userPoints == null)
                return new PointsDto(0, 0, 0);

            return new PointsDto(userPoints.TotalPoints, userPoints.UserStreak, CalculateLevel(userPoints.TotalPoints));
        }

        public async Task<List<BadgeStatusDto>> GetUserBadgesWithStatusAsync(int userId)
        {
            var allBadges = await _badgeRepository.GetAllAsync();
            var ownedBadgeIds = (await _badgeRepository.GetUserBadgesAsync(userId))
                .Select(ub => ub.BadgeId)
                .ToHashSet();

            return allBadges.Select(b => new BadgeStatusDto(
                b.Id,
                b.Name,
                b.Description,
                b.IconUrl,
                ownedBadgeIds.Contains(b.Id)
            )).ToList();
        }

        private int CalculateLevel(int totalPoints)
        {
            return totalPoints / 100;
        }
    }
}
