using EuroTrans.Domain.Activities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EuroTrans.Infrastructure.Persistence.Configurations;

public class ActivityConfiguration : IEntityTypeConfiguration<Activity>
{
    public void Configure(EntityTypeBuilder<Activity> builder)
    {
        builder.ToTable("activities");

        builder.HasKey(a => a.Id);
        builder.Property(s => s.Type)
         .HasConversion<string>()
         .IsRequired();

        builder.Property(a => a.Type).IsRequired();
        builder.Property(a => a.Description).IsRequired();
        builder.Property(a => a.Timestamp).IsRequired();

        builder.HasOne(a => a.User)
            .WithMany(e => e.Activities)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }

}
