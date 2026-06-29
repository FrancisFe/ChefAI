using ChefAI.Domain.Entities;
using ChefAI.Domain.Enums;

namespace ChefAI.Application.DTOs.Challenge
{
    public class ChallengeResultDto
    {
        public RecipeIngredient StarIngredient { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ChallengeStatus Status { get; set; }
    }
}
