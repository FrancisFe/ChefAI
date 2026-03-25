using ChefAI.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace ChefAI.Application.DTOs.User
{
    public class UserDto
    {
        public string Email { get; set; } = string.Empty;
        public UserRole Role { get; set; }
    }
}
