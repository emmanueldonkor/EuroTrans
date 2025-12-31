using EuroTrans.Domain.Trucks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EuroTrans.Infrastructure.Persistence.Configurations;

public class TruckConfiguration : IEntityTypeConfiguration<Truck>
{
    public void Configure(EntityTypeBuilder<Truck> builder)
    {
        builder.ToTable("trucks");

        builder.Property(s => s.Status)
        .HasConversion<string>()
        .IsRequired();

        builder.HasKey(t => t.Id);

        builder.Property(t => t.PlateNumber).IsRequired();
        builder.Property(t => t.Model).IsRequired();
        builder.Property(t => t.Capacity).IsRequired();
        builder.Property(t => t.Status).IsRequired();
        builder.Property(t => t.CreatedAt).IsRequired();

        builder.HasIndex(t => t.PlateNumber).IsUnique();

        builder.HasMany(t => t.Shipments)
            .WithOne(s => s.Truck)
            .HasForeignKey(s => s.TruckId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
