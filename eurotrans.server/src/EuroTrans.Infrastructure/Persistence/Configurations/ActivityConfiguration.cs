using EuroTrans.Domain.Employees;
using EuroTrans.Domain.Shipments;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EuroTrans.Infrastructure.Persistence.Configurations;

public class ActivityConfiguration : IEntityTypeConfiguration<Activity>
{
     public void Configure(EntityTypeBuilder<Activity> builder)
    {
        builder.ToTable("activities");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(a => a.ShipmentId)
            .HasColumnName("shipment_id")
            .IsRequired();

        builder.Property(a => a.EmployeeId)
            .HasColumnName("employee_id")
            .IsRequired();

        builder.Property(a => a.Type)
            .HasColumnName("type")
            .HasConversion<string>()
            .IsRequired();

        builder.Property(a => a.Description)
            .HasColumnName("description")
            .HasMaxLength(1000);

        builder.Property(a => a.TimestampUtc)
            .HasColumnName("timestamp")
            .IsRequired();

        builder.HasOne<Employee>()
         .WithMany()
         .HasForeignKey(a => a.EmployeeId);

    }

}
