using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Domain.Entities;
using ChefAI.Infraestructure.Data;
using System;
using System.Collections.Generic;
using System.Text;

namespace ChefAI.Infraestructure.Repositories
{
    public class RecipeRepository : IRecipeRepository
    {
        private readonly AppDbContext _context;
        public RecipeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task SaveAsync(Recipe recipe, CancellationToken cancellationToken)
        {
            await _context.Recipes.AddAsync(recipe, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
