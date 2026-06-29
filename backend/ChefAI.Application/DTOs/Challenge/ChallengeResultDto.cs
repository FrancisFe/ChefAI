using ChefAI.Domain.Enums;

namespace ChefAI.Application.DTOs.Challenge
{
    public class ChallengeResultDto
    {
        public int Id { get; set; }
        public int StarIngredientId { get; set; }
        public string StarIngredientName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ChallengeStatus Status { get; set; }
        public bool HasParticipated { get; set; }
    }
}
