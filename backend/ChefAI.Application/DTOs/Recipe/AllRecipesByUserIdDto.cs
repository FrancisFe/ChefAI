using ChefAI.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace ChefAI.Application.DTOs.Recipe
{
    public class AllRecipesByUserIdDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public TimeSpan CookingTime { get; set; }
        public int Servings { get; set; }
        public bool IsFavorite { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Steps { get; set; } = string.Empty;
        public List<AllRecipeIngredientDto> Ingredients { get; set; } = new();
    }
}
