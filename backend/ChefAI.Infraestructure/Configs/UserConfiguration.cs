using ChefAI.Domain.Entities;
using ChefAI.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChefAI.Infraestructure.Configs
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("users");

            builder.HasKey(u => u.Id);
            builder.Property(u => u.Email)
                   .IsRequired()
                   .HasMaxLength(150);
            builder.Property(u => u.PasswordHash)
                   .IsRequired();
            builder.Property(u => u.CreatedAt)
                   .IsRequired();
            builder.Property(u => u.IsActive)
                   .IsRequired();
            builder.Property(u => u.RefreshToken)
                   .HasMaxLength(500);
            builder.Property(u => u.TokenExpires);
            builder.HasIndex(u => u.Email)
                   .IsUnique();
            builder.Property(u => u.Role)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .HasDefaultValue(UserRole.User);

            builder.HasOne(u => u.UserProfile)
                   .WithOne(up => up.User)
                   .HasForeignKey<UserProfile>(up => up.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(u => u.UserPoints)
                   .WithOne(up => up.User)
                   .HasForeignKey<UserPoints>(up => up.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
            builder.HasMany(u => u.Recipes)
                   .WithOne(r => r.User)
                   .HasForeignKey(r => r.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
            builder.HasMany(u => u.ChallengeEntries)
                   .WithOne(ce => ce.User)
                   .HasForeignKey(ce => ce.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
            builder.HasMany(u => u.UserBadges)
                   .WithOne(ub => ub.User)
                   .HasForeignKey(ub => ub.UserId);
        }
    }
}
