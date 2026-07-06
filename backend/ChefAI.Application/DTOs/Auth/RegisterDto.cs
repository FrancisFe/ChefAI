using System.ComponentModel.DataAnnotations;

namespace ChefAI.Application.DTOs.Auth
{
    public class RegisterDto : IValidatableObject
    {
        [Required(ErrorMessage = "El nombre de usuario es obligatorio")]
        [MinLength(3, ErrorMessage = "El nombre de usuario debe tener al menos 3 caracteres")]
        [MaxLength(50, ErrorMessage = "El nombre de usuario no puede tener más de 50 caracteres")]
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (Password != ConfirmPassword)
            {
                yield return new ValidationResult(
                    "Las contraseñas no coinciden",
                    new[] { nameof(ConfirmPassword) });
            }
        }
    }
}
