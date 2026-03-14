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

        var totalShipments = await ctx.Shipments.AsNoTracking().CountAsync(ct);
        var activeShipments = await ctx.Shipments.AsNoTracking()
            .CountAsync(s => s.Status == ShipmentStatus.Assigned || s.Status == ShipmentStatus.InTransit, ct);
        var deliveredShipments = await ctx.Shipments.AsNoTracking()
            .CountAsync(s => s.Status == ShipmentStatus.Delivered, ct);

        var activeDrivers = await ctx.Drivers.AsNoTracking()
            .CountAsync(d => d.Status == DriverStatus.OnDuty, ct);
        var availableDrivers = await ctx.Drivers.AsNoTracking()
            .CountAsync(d => d.Status == DriverStatus.Available, ct);

        var shipmentsInRange = await ctx.Shipments.AsNoTracking()
            .Where(s => s.CreatedAtUtc >= fromUtc && s.CreatedAtUtc < toUtcExclusive)
            .Select(s => s.CreatedAtUtc)
            .ToListAsync(ct);

        var shipmentsOverTime = shipmentsInRange
            .GroupBy(date => date.Date)
            .Select(g => new AnalyticsShipmentTrendPoint(g.Key, g.Count()))
            .ToList();

        var deliveryDurations = await ctx.Shipments.AsNoTracking()
            .Where(s => s.StartedAtUtc.HasValue && s.DeliveredAtUtc.HasValue)
            .Select(s => new
            {
                StartedAtUtc = s.StartedAtUtc!.Value,
                DeliveredAtUtc = s.DeliveredAtUtc!.Value,
            })
            .ToListAsync(ct);

        var averageDeliveryHours = deliveryDurations.Count == 0
            ? (double?)null
            : deliveryDurations.Average(item => (item.DeliveredAtUtc - item.StartedAtUtc).TotalHours);

        var activeShipmentRows = await ctx.Shipments.AsNoTracking()
            .Where(s => s.Status == ShipmentStatus.Assigned || s.Status == ShipmentStatus.InTransit)
            .Select(s => new { s.DriverId, s.Status })
            .ToListAsync(ct);

        var driverNames = await ctx.Drivers.AsNoTracking()
            .Select(d => new { d.Id, Name = d.Employee.Name })
            .ToListAsync(ct);

        var driverNameById = driverNames.ToDictionary(d => d.Id, d => d.Name);

        var driverWorkload = activeShipmentRows
            .GroupBy(row =>
            {
                if (row.DriverId.HasValue && driverNameById.TryGetValue(row.DriverId.Value, out var name))
                    return name;

                return "Unassigned";
            })
            .Select(g => new AnalyticsDriverWorkloadPoint(
                g.Key,
                g.Count(s => s.Status == ShipmentStatus.Assigned),
                g.Count(s => s.Status == ShipmentStatus.InTransit),
                g.Count()))
            .OrderByDescending(item => item.Total)
            .ThenBy(item => item.DriverName)
            .Take(workloadLimit)
            .ToList();

        return new AnalyticsOverviewQueryResult(
            TotalShipments: totalShipments,
            ActiveShipments: activeShipments,
            DeliveredShipments: deliveredShipments,
            AverageDeliveryHours: averageDeliveryHours,
            ActiveDrivers: activeDrivers,
            AvailableDrivers: availableDrivers,
            ShipmentsOverTime: shipmentsOverTime,
            DriverWorkloadDistribution: driverWorkload);
    }
}
