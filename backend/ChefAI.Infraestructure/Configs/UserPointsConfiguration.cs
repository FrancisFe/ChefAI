using ChefAI.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChefAI.Infraestructure.Configs
{
    public class UserPointsConfiguration : IEntityTypeConfiguration<UserPoints>
    {
        public void Configure(EntityTypeBuilder<UserPoints> builder)
        {
            builder.ToTable("user_points");

            builder.HasKey(up => up.Id);
            builder.Property(up => up.TotalPoints)
                   .IsRequired();
            builder.Property(up => up.UserStreak)
                    .IsRequired();
            builder.Property(up => up.LastActivityDate)
                   .IsRequired();

            builder.HasOne(up => up.User)
                   .WithOne(u => u.UserPoints)
                   .HasForeignKey<UserPoints>(up => up.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
            builder.HasIndex(up => up.UserId)
                   .IsUnique();
        }
    }
}
