using EuroTrans.Domain.Milestones;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EuroTrans.Infrastructure.Persistence.Configurations;

public class MilestoneConfiguration : IEntityTypeConfiguration<Milestone>
{
    public void Configure(EntityTypeBuilder<Milestone> builder)
    {
        builder.ToTable("milestones");

        builder.HasKey(m => m.Id);

        builder.Property(s => s.Type)
        .HasConversion<string>()
        .IsRequired();


        builder.Property(m => m.Timestamp).IsRequired();
        builder.Property(m => m.Type).IsRequired();
        builder.Property(m => m.Note);

        builder.Property(m => m.LocationAddress).IsRequired();
        builder.Property(m => m.LocationCity).IsRequired();
        builder.Property(m => m.LocationCountry).IsRequired();
        builder.Property(m => m.LocationPostalCode).IsRequired();
        builder.Property(m => m.LocationLat).IsRequired();
        builder.Property(m => m.LocationLng).IsRequired();
    }
}
