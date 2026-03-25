using ChefAI.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChefAI.Infraestructure.Configs
{
    public class ChallengeConfiguration : IEntityTypeConfiguration<Challenge>
    {
        public void Configure(EntityTypeBuilder<Challenge> builder)
        {
            builder.ToTable("challenges");

            builder.HasKey(c => c.Id);
            builder.Property(c => c.StartDate).IsRequired();
            builder.Property(c => c.EndDate).IsRequired();
            builder.Property(c => c.Status).IsRequired();
            builder.HasOne(c => c.StarIngredient)
                .WithMany()
                .HasForeignKey(c => c.StarIngredientId)
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasMany(c => c.Entries)
                .WithOne(e => e.Challenge)
                .HasForeignKey(e => e.ChallengeId);
        }
    }
}
