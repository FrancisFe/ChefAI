using ChefAI.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChefAI.Infraestructure.Configs
{
    public class UserBadgeConfiguration : IEntityTypeConfiguration<UserBadge>
    {
        public void Configure(EntityTypeBuilder<UserBadge> builder)
        {
            builder.ToTable("user_badges");

            builder.HasKey(ub => new { ub.UserId, ub.BadgeId });
            builder.Property(ub => ub.EarnedAt)
                   .IsRequired();

            builder.HasOne(ub => ub.User)
                   .WithMany(u => u.UserBadges)
                   .HasForeignKey(ub => ub.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ub => ub.Badge)
                   .WithMany(b => b.UserBadges)
                   .HasForeignKey(ub => ub.BadgeId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
