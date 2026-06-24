using ChefAI.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChefAI.Infraestructure.Configs
{
    public class BadgeConfiguration : IEntityTypeConfiguration<Badge>
    {
        public void Configure(EntityTypeBuilder<Badge> builder)
        {
            builder.ToTable("badges");

            builder.HasKey(b => b.Id);
            builder.Property(a => a.Name).IsRequired().HasMaxLength(100);
            builder.Property(a => a.Description).HasMaxLength(500);
            builder.Property(a => a.IconUrl).IsRequired().HasMaxLength(200);
            builder.Property(a => a.Condition).IsRequired().HasMaxLength(50);
            builder.Property(a => a.ConditionValue);

            builder.HasMany(b => b.UserBadges)
               .WithOne(ub => ub.Badge)
               .HasForeignKey(ub => ub.BadgeId);

            builder.HasData(
                new Badge { Id = 1, Name = "Primera receta", Description = "Generá tu primera receta", IconUrl = "", Condition = "TotalRecipes", ConditionValue = 1 },
                new Badge { Id = 2, Name = "Cocinero curioso", Description = "Generá 10 recetas", IconUrl = "", Condition = "TotalRecipes", ConditionValue = 10 },
                new Badge { Id = 3, Name = "Chef prolífico", Description = "Generá 50 recetas", IconUrl = "", Condition = "TotalRecipes", ConditionValue = 50 },
                new Badge { Id = 4, Name = "Racha de fuego", Description = "Mantené una racha de 7 días", IconUrl = "", Condition = "CurrentStreak", ConditionValue = 7 },
                new Badge { Id = 5, Name = "Coleccionista", Description = "Marcá 5 recetas como favoritas", IconUrl = "", Condition = "TotalFavorites", ConditionValue = 5 },
                new Badge { Id = 6, Name = "Primer desafío", Description = "Participá en tu primer desafío", IconUrl = "", Condition = "HasParticipatedInChallenge" },
                new Badge { Id = 7, Name = "Popular", Description = "Recibí 10 votos en desafíos", IconUrl = "", Condition = "TotalVotesReceived", ConditionValue = 10 },
                new Badge { Id = 8, Name = "Explorador", Description = "Usá la detección por foto", IconUrl = "", Condition = "HasUsedPhotoDetection" }
            );
        }
    }
}
