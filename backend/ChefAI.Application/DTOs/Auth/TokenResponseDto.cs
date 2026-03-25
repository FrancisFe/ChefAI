namespace ChefAI.Application.DTOs.Auth
{
    public class TokenResponseDto
    {
        public string? Token { get; set; }
        public DateTime ExpiresAt { get; set; }
        public string? RefreshToken { get; set; }
    }
}
