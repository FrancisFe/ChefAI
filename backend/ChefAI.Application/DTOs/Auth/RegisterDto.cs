using System.ComponentModel.DataAnnotations;

namespace ChefAI.Application.DTOs.Auth
{
    public class RegisterDto : IValidatableObject
    {
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
