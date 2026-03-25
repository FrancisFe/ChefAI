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
            builder.HasMany(b => b.UserBadges)
               .WithOne(ub => ub.Badge)
               .HasForeignKey(ub => ub.BadgeId);
        }
    }
}
