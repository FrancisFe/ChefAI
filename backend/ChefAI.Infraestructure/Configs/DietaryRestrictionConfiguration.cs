using ChefAI.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChefAI.Infraestructure.Configs
{
    public class DietaryRestrictionConfiguration : IEntityTypeConfiguration<DietaryRestriction>
    {
        public void Configure(EntityTypeBuilder<DietaryRestriction> builder)
        {
            builder.ToTable("dietary_restrictions");

            builder.HasKey(dr => dr.Id);
            builder.Property(dr => dr.Name).IsRequired().HasMaxLength(100);
            builder.Property(dr => dr.Description).HasMaxLength(500);

            builder.HasMany(dr => dr.Recipes)
                .WithMany(r => r.DietaryRestrictions)
                .UsingEntity(j => j.ToTable("recipe_dietary_restriction"));

            builder.HasMany(dr => dr.UserProfiles)
                .WithMany(up => up.DietaryRestrictions)
                .UsingEntity(j => j.ToTable("user_profile_dietary_restriction"));

            builder.HasData(
                new DietaryRestriction { Id = 1, Name = "Vegetarian", Description = "No meat or fish, but may include dairy and eggs." },
                new DietaryRestriction { Id = 2, Name = "Vegan", Description = "No animal products, including dairy and eggs." },
                new DietaryRestriction { Id = 3, Name = "Gluten-Free", Description = "No gluten-containing grains such as wheat, barley, and rye." },
                new DietaryRestriction { Id = 4, Name = "Dairy-Free", Description = "No dairy products." },
                new DietaryRestriction { Id = 5, Name = "Nut-Free", Description = "No nuts or products containing nuts." },
                new DietaryRestriction { Id = 6, Name = "Pescatarian", Description = "No meat, but includes fish and seafood." },
                new DietaryRestriction { Id = 7, Name = "Keto", Description = "Low-carb, high-fat diet that focuses on foods like meat, fish, eggs, dairy, nuts, and low-carb vegetables." },
                new DietaryRestriction { Id = 8, Name = "No-Pork", Description = "Excludes pork and pork products." },
                new DietaryRestriction { Id = 9, Name = "Low-Carb", Description = "Limits carbohydrate intake, focusing on proteins and fats." }
               );
        }
    }
}
