using ChefAI.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChefAI.Infraestructure.Configs
{
    public class VoteConfiguration : IEntityTypeConfiguration<Vote>
    {
        public void Configure(EntityTypeBuilder<Vote> builder)
        {
            builder.ToTable("votes");

            builder.HasKey(v => v.Id);

            builder.Property(v => v.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.HasIndex(v => new { v.UserId, v.ChallengeEntryId })
                .IsUnique();

            builder.HasOne(v => v.User)
                .WithMany(u => u.Votes)
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(v => v.ChallengeEntry)
                .WithMany(ce => ce.Votes)
                .HasForeignKey(v => v.ChallengeEntryId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
