using EuroTrans.Domain.Employees;
using EuroTrans.Domain.Shipments;
using EuroTrans.Domain.Trucks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EuroTrans.Infrastructure.Persistence.Configurations;

public class ShipmentConfiguration : IEntityTypeConfiguration<Shipment>
{
    public void Configure(EntityTypeBuilder<Shipment> builder)
    {
        builder.ToTable("shipments");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(s => s.TrackingId)
            .HasColumnName("tracking_id")
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(s => s.TrackingId).IsUnique();

        builder.Property(s => s.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .IsRequired();

        // Cargo
        builder.OwnsOne(s => s.Cargo, cb =>
        {
            cb.Property(c => c.Description)
                .HasColumnName("cargo_description")
                .IsRequired()
                .HasMaxLength(500);

            cb.Property(c => c.Weight)
                .HasColumnName("cargo_weight")
                .IsRequired();

            cb.Property(c => c.Volume)
                .HasColumnName("cargo_volume")
                .IsRequired();
        });
        builder.Navigation(s => s.Cargo).IsRequired();

        // Origin
        builder.OwnsOne(s => s.OriginAddress, ob =>
        {
            ob.Property(o => o.AddressLine).HasColumnName("origin_address").IsRequired().HasMaxLength(500);
            ob.Property(o => o.City).HasColumnName("origin_city").IsRequired().HasMaxLength(200);
            ob.Property(o => o.Country).HasColumnName("origin_country").IsRequired().HasMaxLength(200);
            ob.Property(o => o.PostalCode).HasColumnName("origin_postal_code").IsRequired().HasMaxLength(50);
        });
        builder.Navigation(s => s.OriginAddress).IsRequired();
        builder.OwnsOne(s => s.OriginLocation, ol =>
        {
            ol.Property(l => l.Latitude).HasColumnName("origin_lat").IsRequired();
            ol.Property(l => l.Longitude).HasColumnName("origin_lng").IsRequired();
        });
        builder.Navigation(s => s.OriginLocation).IsRequired();

        // Destination
        builder.OwnsOne(s => s.DestinationAddress, db =>
        {
            db.Property(o => o.AddressLine).HasColumnName("destination_address").IsRequired().HasMaxLength(500);
            db.Property(o => o.City).HasColumnName("destination_city").IsRequired().HasMaxLength(200);
            db.Property(o => o.Country).HasColumnName("destination_country").IsRequired().HasMaxLength(200);
            db.Property(o => o.PostalCode).HasColumnName("destination_postal_code").IsRequired().HasMaxLength(50);
        });
        builder.Navigation(s => s.DestinationAddress).IsRequired();
        builder.OwnsOne(s => s.DestinationLocation, dl =>
        {
            dl.Property(l => l.Latitude).HasColumnName("destination_lat").IsRequired();
            dl.Property(l => l.Longitude).HasColumnName("destination_lng").IsRequired();
        });
        builder.Navigation(s => s.DestinationLocation).IsRequired();

        builder.Property(s => s.DriverId)
            .HasColumnName("driver_id");

        builder.Property(s => s.TruckId)
            .HasColumnName("truck_id");

        builder.Property(s => s.CreatedAtUtc)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(s => s.UpdatedAtUtc)
            .HasColumnName("updated_at");

        builder.Property(s => s.StartedAtUtc)
            .HasColumnName("started_at");

        builder.Property(s => s.DeliveredAtUtc)
            .HasColumnName("delivered_at");

        builder.Property(s => s.EstimatedDeliveryDateUtc)
            .HasColumnName("estimated_delivery_date");

        builder.HasMany(s => s.Activities)
         .WithOne(a => a.Shipment)
         .HasForeignKey(a => a.ShipmentId)
         .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Milestones)
            .WithOne(a => a.Shipment)
            .HasForeignKey(m => m.ShipmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Documents)
            .WithOne(a => a.Shipment)
            .HasForeignKey(d => d.ShipmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Driver)
        .WithMany()
        .HasForeignKey(s => s.DriverId)
        .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(s => s.DriverId)
            .HasFilter("driver_id IS NOT NULL AND status IN ('Assigned', 'InTransit')")
            .IsUnique();

        builder.HasOne(s => s.Truck)
            .WithMany()
            .HasForeignKey(s => s.TruckId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(s => s.TruckId)
            .HasFilter("truck_id IS NOT NULL AND status IN ('Assigned', 'InTransit')")
            .IsUnique();

        builder.Metadata.FindNavigation(nameof(Shipment.Activities))!
                        .SetPropertyAccessMode(PropertyAccessMode.Field);
        builder.Metadata.FindNavigation(nameof(Shipment.Milestones))!
                        .SetPropertyAccessMode(PropertyAccessMode.Field);
        builder.Metadata.FindNavigation(nameof(Shipment.Documents))!
                        .SetPropertyAccessMode(PropertyAccessMode.Field);

        builder.Property(s => s.RowVersion)
            .IsConcurrencyToken()
            .IsRequired();

    }

}
