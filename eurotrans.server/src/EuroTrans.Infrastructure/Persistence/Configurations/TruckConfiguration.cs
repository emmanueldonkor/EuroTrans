using EuroTrans.Domain.Trucks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EuroTrans.Infrastructure.Persistence.Configurations;

public class TruckConfiguration : IEntityTypeConfiguration<Truck>
{
    public void Configure(EntityTypeBuilder<Truck> builder)
    {
        builder.ToTable("trucks");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(t => t.PlateNumber)
            .HasColumnName("plate_number")
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(t => t.PlateNumber).IsUnique();

        builder.Property(t => t.Model)
            .HasColumnName("model")
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.Capacity)
            .HasColumnName("capacity")
            .IsRequired();

        builder.Property(t => t.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .IsRequired();

        builder.Property(t => t.CreatedAtUtc)
            .HasColumnName("created_at")
            .IsRequired();
    }

}
