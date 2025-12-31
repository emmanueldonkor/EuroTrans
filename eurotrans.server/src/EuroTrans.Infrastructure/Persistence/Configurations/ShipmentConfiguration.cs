using EuroTrans.Domain.Shipments;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EuroTrans.Infrastructure.Persistence.Configurations;

public class ShipmentConfiguration : IEntityTypeConfiguration<Shipment>
{
    public void Configure(EntityTypeBuilder<Shipment> builder)
    {
        builder.ToTable("shipments");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Status)
        .HasConversion<string>()
        .IsRequired();


        builder.Property(s => s.TrackingId).IsRequired();
        builder.HasIndex(s => s.TrackingId).IsUnique();

        builder.Property(s => s.Status).IsRequired();

        builder.Property(s => s.CargoDescription).IsRequired();
        builder.Property(s => s.CargoWeight).IsRequired();
        builder.Property(s => s.CargoVolume).IsRequired();

        builder.Property(s => s.OriginAddress).IsRequired();
        builder.Property(s => s.OriginCity).IsRequired();
        builder.Property(s => s.OriginCountry).IsRequired();
        builder.Property(s => s.OriginPostalCode).IsRequired();

        builder.Property(s => s.DestinationAddress).IsRequired();
        builder.Property(s => s.DestinationCity).IsRequired();
        builder.Property(s => s.DestinationCountry).IsRequired();
        builder.Property(s => s.DestinationPostalCode).IsRequired();

        builder.Property(s => s.CurrentLocationJson)
            .HasColumnType("TEXT");

        builder.Property(s => s.CreatedAt).IsRequired();
        builder.Property(s => s.UpdatedAt);
        builder.Property(s => s.StartedAt);
        builder.Property(s => s.DeliveredAt);
        builder.Property(s => s.EstimatedDeliveryDate);
        builder.Property(s => s.ProofOfDeliveryUrl);

        builder.HasMany(s => s.Milestones)
            .WithOne(m => m.Shipment)
            .HasForeignKey(m => m.ShipmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Activities)
            .WithOne(a => a.Shipment)
            .HasForeignKey(a => a.ShipmentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
