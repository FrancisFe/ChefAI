namespace ChefAI.Application.DTOs
{
    public record PointsResult(int PointsEarned, int TotalPoints, int CurrentLevel);
    public record StreakResult(int CurrentStreak, bool IsStreakIncreased);
    public record BadgeResult(bool BadgeUnlocked, string? BadgeName, string? BadgeIcon);

    public record PointsDto(int TotalPoints, int CurrentStreak, int CurrentLevel);
    public record BadgeStatusDto(int Id, string Name, string? Description, string IconUrl, bool IsUnlocked);
}
