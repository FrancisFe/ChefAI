using ChefAI.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace ChefAI.Application.DTOs.Recipe
{
    public class AllRecipesByUserIdDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public TimeSpan CookingTime { get; set; }
        public int Servings { get; set; }
        public bool IsFavorite { get; set; }
        public List<AllRecipeIngredientDto> Ingredients { get; set; } = new();
    }
}
