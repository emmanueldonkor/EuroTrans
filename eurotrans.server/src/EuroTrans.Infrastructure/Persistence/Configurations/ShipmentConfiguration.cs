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
                .HasMaxLength(500);

            cb.Property(c => c.Weight)
                .HasColumnName("cargo_weight")
                .IsRequired();

            cb.Property(c => c.Volume)
                .HasColumnName("cargo_volume")
                .IsRequired();
        });

        // Origin
        builder.OwnsOne(s => s.OriginAddress, ob =>
        {
            ob.Property(o => o.AddressLine).HasColumnName("origin_address").HasMaxLength(500);
            ob.Property(o => o.City).HasColumnName("origin_city").HasMaxLength(200);
            ob.Property(o => o.Country).HasColumnName("origin_country").HasMaxLength(200);
            ob.Property(o => o.PostalCode).HasColumnName("origin_postal_code").HasMaxLength(50);
        });
        builder.OwnsOne(s => s.OriginLocation, ol =>
        {
            ol.Property(l => l.Latitude).HasColumnName("origin_lat");
            ol.Property(l => l.Longitude).HasColumnName("origin_lng");
        });

        // Destination
        builder.OwnsOne(s => s.DestinationAddress, db =>
        {
            db.Property(o => o.AddressLine).HasColumnName("destination_address").HasMaxLength(500);
            db.Property(o => o.City).HasColumnName("destination_city").HasMaxLength(200);
            db.Property(o => o.Country).HasColumnName("destination_country").HasMaxLength(200);
            db.Property(o => o.PostalCode).HasColumnName("destination_postal_code").HasMaxLength(50);
        });
        builder.OwnsOne(s => s.DestinationLocation, dl =>
        {
            dl.Property(l => l.Latitude).HasColumnName("destination_lat");
            dl.Property(l => l.Longitude).HasColumnName("destination_lng");
        });

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
         .WithOne()
         .HasForeignKey(a => a.ShipmentId)
         .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Milestones)
            .WithOne()
            .HasForeignKey(m => m.ShipmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Documents)
            .WithOne()
            .HasForeignKey(d => d.ShipmentId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne<Driver>()
        .WithMany()
        .HasForeignKey(s => s.DriverId);

        builder.HasOne<Truck>()
        .WithMany()
        .HasForeignKey(s => s.TruckId);
    }

}
