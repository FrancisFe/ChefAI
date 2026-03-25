using Microsoft.EntityFrameworkCore;
using ChefAI.Domain.Entities;

namespace ChefAI.Infraestructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
        {
        }
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<UserProfile> Profiles { get; set; } = null!;
        public DbSet<Badge> Badges { get; set; } = null!;
        public DbSet<Challenge> Challenges { get; set; } = null!;
        public DbSet<ChallengeEntry> ChallengeEntries { get; set; } = null!;
        public DbSet<DietaryRestriction> DietaryRestrictions { get; set; } = null!;
        public DbSet<UserBadge> UserBadges { get; set; } = null!;
        public DbSet<UserPoints> UserPoints { get; set; } = null!;
        public DbSet<Recipe> Recipes { get; set; } = null!;
        public DbSet<RecipeIngredient> RecipeIngredients { get; set; } = null!;
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }

    }
}
