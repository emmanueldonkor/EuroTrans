using EuroTrans.Domain.Shipments;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EuroTrans.Infrastructure.Persistence.Configurations;

public class DocumentConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        builder.ToTable("documents");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(d => d.ShipmentId)
            .HasColumnName("shipment_id")
            .IsRequired();

        builder.Property(d => d.UploadedByEmployeeId)
            .HasColumnName("uploaded_by_employee_id")
            .IsRequired();

        builder.Property(d => d.Type)
            .HasColumnName("type")
            .HasConversion<string>()
            .IsRequired();

        builder.Property(d => d.Url)
            .HasColumnName("url")
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(d => d.UploadedAtUtc)
            .HasColumnName("uploaded_at")
            .IsRequired();
    }
}