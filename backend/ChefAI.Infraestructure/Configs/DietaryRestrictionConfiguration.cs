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
        }
    }
}
