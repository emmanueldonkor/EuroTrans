using EuroTrans.Domain.Shipments;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EuroTrans.Infrastructure.Persistence.Configurations;

public class MilestoneConfiguration : IEntityTypeConfiguration<Milestone>
{
    public void Configure(EntityTypeBuilder<Milestone> builder)
    {
        builder.ToTable("milestones");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(m => m.ShipmentId)
            .HasColumnName("shipment_id")
            .IsRequired();

        builder.Property(m => m.CreatedByEmployeeId)
            .HasColumnName("created_by_employee_id")
            .IsRequired();

       /* builder.Property(m => m.Type)
            .HasColumnName("type")
            .HasConversion<string>()
            .IsRequired(); */

        builder.Property(m => m.Note)
            .HasColumnName("note")
            .HasMaxLength(1000);

        builder.Property(m => m.LocationLat)
            .HasColumnName("location_lat")
            .IsRequired();

        builder.Property(m => m.LocationLng)
            .HasColumnName("location_lng")
            .IsRequired();

        builder.Property(m => m.TimestampUtc)
            .HasColumnName("timestamp")
            .IsRequired();
    }

}
