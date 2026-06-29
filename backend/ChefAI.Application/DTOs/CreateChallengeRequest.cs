namespace ChefAI.Application.DTOs
{
    public class CreateChallengeRequest
    {
        public int StarIngredientId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
