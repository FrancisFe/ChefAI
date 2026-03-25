using System.ComponentModel.DataAnnotations;

namespace ChefAI.Application.DTOs.Auth
{
    public class RefreshTokenDto
    {
        [Required(ErrorMessage = "Refresh token es requerido")]
        public string? RefreshToken { get; set; }
    }
}
