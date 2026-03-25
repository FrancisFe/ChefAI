using ChefAI.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChefAI.Infraestructure.Configs
{
    public class RecipeConfiguration : IEntityTypeConfiguration<Recipe>
    {
        public void Configure(EntityTypeBuilder<Recipe> builder)
        {
            builder.ToTable("recipes");

            builder.HasKey(r => r.Id);
            builder.Property(r => r.Title)
                   .IsRequired()
                   .HasMaxLength(150);
            builder.Property(r => r.Description)
                   .IsRequired()
                   .HasMaxLength(1000);
            builder.Property(r => r.CookingTime)
                   .IsRequired();
            builder.Property(r => r.Servings)
                   .IsRequired();
            builder.Property(r => r.IsFavorite)
                   .IsRequired();
            builder.Property(r => r.CreatedAt)
                   .IsRequired();

            builder.HasOne(r => r.User)
                   .WithMany(u => u.Recipes)
                   .HasForeignKey(r => r.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
            builder.HasMany(r => r.Ingredients)
                   .WithOne(i => i.Recipe)
                   .HasForeignKey(i => i.RecipeId)
                   .OnDelete(DeleteBehavior.Cascade);
            builder.HasMany(r => r.DietaryRestrictions)
                   .WithMany(dr => dr.Recipes)
                   .UsingEntity(j => j.ToTable("recipe_dietary_restriction"));
            builder.HasMany(r => r.ChallengeEntries)
                   .WithOne(ce => ce.Recipe)
                   .HasForeignKey(ce => ce.RecipeId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
