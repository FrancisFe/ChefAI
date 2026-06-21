using System.ComponentModel.DataAnnotations;

namespace ChefAI.Application.DTOs.Auth
{
    public class LoginDto
    {
        [Required(ErrorMessage = "El email es requerido")]
        public string Email { get; set; } = string.Empty;
        [Required(ErrorMessage = "La contraseña es requerida")]
        public string Password { get; set; } = string.Empty;
    }
}
