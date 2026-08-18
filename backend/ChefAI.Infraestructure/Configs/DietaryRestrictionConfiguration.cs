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
                new DietaryRestriction { Id = 1, Name = "Vegetariano", Description = "Sin carne ni pescado, pero puede incluir lácteos y huevos." },
                new DietaryRestriction { Id = 2, Name = "Vegano", Description = "Sin productos de origen animal, incluidos lácteos y huevos." },
                new DietaryRestriction { Id = 3, Name = "Sin Gluten", Description = "Sin cereales que contengan gluten como trigo, cebada y centeno." },
                new DietaryRestriction { Id = 4, Name = "Sin Lácteos", Description = "Sin productos lácteos." },
                new DietaryRestriction { Id = 5, Name = "Sin Frutos Secos", Description = "Sin frutos secos ni productos que los contengan." },
                new DietaryRestriction { Id = 6, Name = "Pescetariano", Description = "Sin carne, pero incluye pescado y mariscos." },
                new DietaryRestriction { Id = 7, Name = "Keto", Description = "Dieta baja en carbohidratos y alta en grasas, enfocada en carnes, pescado, huevos, lácteos, frutos secos y vegetales bajos en carbohidratos." },
                new DietaryRestriction { Id = 8, Name = "Sin Cerdo", Description = "Excluye cerdo y productos derivados." },
                new DietaryRestriction { Id = 9, Name = "Bajo en Carbohidratos", Description = "Limita la ingesta de carbohidratos, centrándose en proteínas y grasas." }
               );
        }
    }
}
