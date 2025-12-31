using EuroTrans.Domain.Drivers;
using EuroTrans.Domain.Employees;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EuroTrans.Infrastructure.Persistence.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    
       public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("employees");

        builder.HasKey(e => e.Id);

        builder.Property(s => s.Role)
        .HasConversion<string>()
        .IsRequired();

        builder.Property(e => e.Name).IsRequired();
        builder.Property(e => e.Email).IsRequired();
        builder.Property(e => e.Role).IsRequired();
        builder.Property(e => e.CreatedAt).IsRequired();

        builder.HasIndex(e => e.Email).IsUnique();

        builder.HasOne(e => e.Driver)
            .WithOne(d => d.Employee)
            .HasForeignKey<Driver>(d => d.Id)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Activities)
            .WithOne(a => a.User)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}