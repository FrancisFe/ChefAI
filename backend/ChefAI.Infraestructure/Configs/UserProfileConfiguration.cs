using ChefAI.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChefAI.Infraestructure.Configs
{
    public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
    {
        public void Configure(EntityTypeBuilder<UserProfile> builder)
        {
            builder.ToTable("user_profiles");

            builder.HasKey(up => up.Id);
            builder.Property(up => up.PreferredDifficulty)
                   .IsRequired()
                   .HasMaxLength(50);
            builder.Property(up => up.MaxCookingTime)
                   .IsRequired();
            builder.Property(up => up.DefaultServings)
                   .IsRequired();

            builder.HasOne(up => up.User)
                   .WithOne(u => u.UserProfile)
                   .HasForeignKey<UserProfile>(up => up.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
            builder.HasIndex(up => up.UserId)
                   .IsUnique();
            builder.HasMany(up => up.DietaryRestrictions)
                   .WithMany(dr => dr.UserProfiles)
                   .UsingEntity(j => j.ToTable("user_profile_dietary_restriction"));
        }
    }
}
