using EuroTrans.Domain.Drivers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EuroTrans.Infrastructure.Persistence.Configurations;

public class DriverConfiguration : IEntityTypeConfiguration<Driver>
{
    public void Configure(EntityTypeBuilder<Driver> builder)
    {
        builder.ToTable("drivers");

        builder.HasKey(d => d.Id);

        builder.Property(s => s.Status)
        .HasConversion<string>()
        .IsRequired();

        builder.Property(d => d.Phone).IsRequired();
        builder.Property(d => d.LicenseNumber).IsRequired();
        builder.Property(d => d.Status).IsRequired();

        builder.HasOne(d => d.CurrentShipment)
            .WithOne()
            .HasForeignKey<Driver>(d => d.CurrentShipmentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(d => d.Shipments)
            .WithOne(s => s.Driver)
            .HasForeignKey(s => s.DriverId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
