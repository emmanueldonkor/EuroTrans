using EuroTrans.Domain.Employees;
using EuroTrans.Domain.Employees.Enums;
using EuroTrans.Domain.Shipments;
using EuroTrans.Domain.Trucks;
using Microsoft.EntityFrameworkCore;

namespace EuroTrans.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    private static readonly DateTime SeedCreatedAtUtc = new(2026, 2, 20, 0, 0, 0, DateTimeKind.Utc);

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    { }

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<Truck> Trucks => Set<Truck>();
    public DbSet<Shipment> Shipments => Set<Shipment>();
    public DbSet<Milestone> Milestones => Set<Milestone>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<Document> Documents => Set<Document>();

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ApplyConcurrencyTokens();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        ApplyConcurrencyTokens();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Employee>().HasData(new Employee(
            id: Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"),
            auth0UserId: "seed|manager",
            name: "Seed Manager",
            email: "manager@eurotrans.local",
            role: EmployeeRole.Manager,
            avatarUrl: null,
            createdAtUtc: SeedCreatedAtUtc));

    }

    private void ApplyConcurrencyTokens()
    {
        foreach (var entry in ChangeTracker.Entries()
            .Where(e => e.State is EntityState.Added or EntityState.Modified))
        {
            var rowVersionProperty = entry.Metadata.FindProperty("RowVersion");
            if (rowVersionProperty?.ClrType != typeof(byte[]))
                continue;

            entry.Property("RowVersion").CurrentValue = Guid.NewGuid().ToByteArray();
        }
    }
}
