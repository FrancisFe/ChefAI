using ChefAI.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChefAI.Infraestructure.Configs
{
    public class ChallengeEntryConfiguration : IEntityTypeConfiguration<ChallengeEntry>
    {
        public void Configure(EntityTypeBuilder<ChallengeEntry> builder)
        {
            builder.ToTable("challenge_entries");

            builder.HasKey(ce => ce.Id);
            builder.Property(a => a.VoteCount).HasDefaultValue(0);
            builder.HasOne(re => re.Recipe)
                .WithMany(r => r.ChallengeEntries)
                .HasForeignKey(re => re.RecipeId);
            builder.HasOne(ce => ce.Challenge)
                .WithMany(c => c.Entries)
                .HasForeignKey(ce => ce.ChallengeId);
            builder.HasOne(ce => ce.User)
                .WithMany(u => u.ChallengeEntries)
                .HasForeignKey(ce => ce.UserId);
        }
    }
}