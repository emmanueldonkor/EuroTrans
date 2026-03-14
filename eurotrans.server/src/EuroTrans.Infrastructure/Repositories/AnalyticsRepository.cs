using EuroTrans.Application.features.Analytics;
using EuroTrans.Domain.Employees.Enums;
using EuroTrans.Domain.Shipments.Enums;
using EuroTrans.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EuroTrans.Infrastructure.Repositories;

public class AnalyticsRepository : IAnalyticsRepository
{
    private readonly IDbContextFactory<AppDbContext> dbFactory;

    public AnalyticsRepository(IDbContextFactory<AppDbContext> dbFactory)
    {
        this.dbFactory = dbFactory;
    }

    public async Task<AnalyticsOverviewQueryResult> GetOverviewAsync(
        DateTime fromUtc,
        DateTime toUtcExclusive,
        int workloadLimit,
        CancellationToken ct = default)
    {
        // Single context to avoid connection spikes on smaller Postgres tiers.
        await using var ctx = await dbFactory.CreateDbContextAsync(ct);

        var shipmentStats = await ctx.Shipments.AsNoTracking()
            .GroupBy(s => 1)
            .Select(g => new
            {
                Total = g.Count(),
                Active = g.Count(s => s.Status == ShipmentStatus.Assigned || s.Status == ShipmentStatus.InTransit),
                Delivered = g.Count(s => s.Status == ShipmentStatus.Delivered)
            })
            .FirstOrDefaultAsync(ct);

        var driverStats = await ctx.Drivers.AsNoTracking()
            .GroupBy(d => 1)
            .Select(g => new
            {
                Active = g.Count(d => d.Status == DriverStatus.OnDuty),
                Available = g.Count(d => d.Status == DriverStatus.Available)
            })
            .FirstOrDefaultAsync(ct);

        var shipmentsOverTime = await ctx.Shipments.AsNoTracking()
            .Where(s => s.CreatedAtUtc >= fromUtc && s.CreatedAtUtc < toUtcExclusive)
            .GroupBy(s => s.CreatedAtUtc.Date)
            .Select(g => new AnalyticsShipmentTrendPoint(g.Key, g.Count()))
            .ToListAsync(ct);

        var deliveryDurations = await ctx.Shipments.AsNoTracking()
            .Where(s => s.StartedAtUtc.HasValue && s.DeliveredAtUtc.HasValue)
            .Select(s => new
            {
                StartedAtUtc = s.StartedAtUtc!.Value,
                DeliveredAtUtc = s.DeliveredAtUtc!.Value,
            })
            .ToListAsync(ct);

        var driverWorkload = await ctx.Shipments.AsNoTracking()
            .Where(s => s.Status == ShipmentStatus.Assigned || s.Status == ShipmentStatus.InTransit)
            .GroupBy(s => s.Driver != null ? s.Driver.Employee.Name : "Unassigned")
            .Select(g => new AnalyticsDriverWorkloadPoint(
                g.Key,
                g.Count(s => s.Status == ShipmentStatus.Assigned),
                g.Count(s => s.Status == ShipmentStatus.InTransit),
                g.Count()))
            .OrderByDescending(item => item.Total)
            .ThenBy(item => item.DriverName)
            .Take(workloadLimit)
            .ToListAsync(ct);

        var averageDeliveryHours = deliveryDurations.Count == 0
            ? (double?)null
            : deliveryDurations.Average(item => (item.DeliveredAtUtc - item.StartedAtUtc).TotalHours);

        return new AnalyticsOverviewQueryResult(
            TotalShipments: shipmentStats?.Total ?? 0,
            ActiveShipments: shipmentStats?.Active ?? 0,
            DeliveredShipments: shipmentStats?.Delivered ?? 0,
            AverageDeliveryHours: averageDeliveryHours,
            ActiveDrivers: driverStats?.Active ?? 0,
            AvailableDrivers: driverStats?.Available ?? 0,
            ShipmentsOverTime: shipmentsOverTime,
            DriverWorkloadDistribution: driverWorkload);
    }
}
