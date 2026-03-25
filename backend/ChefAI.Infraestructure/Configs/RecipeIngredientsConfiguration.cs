using ChefAI.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChefAI.Infraestructure.Configs
{
    public class RecipeIngredientsConfiguration : IEntityTypeConfiguration<RecipeIngredient>
    {
        public void Configure(EntityTypeBuilder<RecipeIngredient> builder)
        {
            builder.ToTable("recipe_ingredients");

            builder.HasKey(ri => ri.Id);
            builder.Property(ri => ri.Name)
                   .IsRequired()
                   .HasMaxLength(100);
            builder.Property(ri => ri.Quantity)
                   .IsRequired()
                   .HasColumnType("decimal(10,2)");
            builder.Property(ri => ri.Unit)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.HasOne(ri => ri.Recipe)
                   .WithMany(r => r.Ingredients)
                   .HasForeignKey(ri => ri.RecipeId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
