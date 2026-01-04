using EuroTrans.Domain.Employees;
using EuroTrans.Domain.Shipments;
using EuroTrans.Domain.Trucks;
using Microsoft.EntityFrameworkCore;

namespace EuroTrans.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options): base(options)
    {}

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<Truck> Trucks => Set<Truck>();
    public DbSet<Shipment> Shipments => Set<Shipment>();
    public DbSet<Milestone> Milestones => Set<Milestone>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<Document> Documents => Set<Document>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}