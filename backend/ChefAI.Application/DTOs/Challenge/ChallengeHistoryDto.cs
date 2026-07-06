namespace ChefAI.Application.DTOs.Challenge
{
    public class ChallengeHistoryDto
    {
        public int Id { get; set; }
        public string StarIngredientName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int ParticipationCount { get; set; }
    }
}
