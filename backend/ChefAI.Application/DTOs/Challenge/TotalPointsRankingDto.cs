namespace ChefAI.Application.DTOs.Challenge
{
    public class TotalPointsRankingDto
    {
        public int Rank { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int TotalVotes { get; set; }
    }
}
