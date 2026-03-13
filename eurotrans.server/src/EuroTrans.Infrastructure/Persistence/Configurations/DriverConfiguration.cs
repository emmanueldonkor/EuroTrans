using EuroTrans.Domain.Employees;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EuroTrans.Infrastructure.Persistence.Configurations;

public class DriverConfiguration : IEntityTypeConfiguration<Driver>
{
    public void Configure(EntityTypeBuilder<Driver> builder)
    {
        builder.ToTable("drivers");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.Id)
            .HasColumnName("employee_id")
            .ValueGeneratedNever();

        builder.HasOne(d => d.Employee)
            .WithOne(e => e.Driver)
            .HasForeignKey<Driver>(d => d.Id)
            .HasPrincipalKey<Employee>(e => e.Id);

        builder.Property(d => d.Phone)
            .HasColumnName("phone")
            .HasMaxLength(50);

        builder.Property(d => d.LicenseNumber)
            .HasColumnName("license_number")
            .HasMaxLength(100);

        builder.Property(d => d.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .IsRequired();

        builder.Property(d => d.RowVersion)
           .IsConcurrencyToken()
           .IsRequired();

        // Performance Indices
        builder.HasIndex(d => d.Status);
    }
}
