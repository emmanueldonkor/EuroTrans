using EuroTrans.Application.features.Analytics;
using EuroTrans.Domain.Employees.Enums;
using EuroTrans.Domain.Shipments.Enums;
using EuroTrans.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EuroTrans.Infrastructure.Repositories;

public class AnalyticsRepository : IAnalyticsRepository
{
    private readonly AppDbContext db;

    public AnalyticsRepository(AppDbContext db)
    {
        this.db = db;
    }

    public async Task<AnalyticsOverviewQueryResult> GetOverviewAsync(
        DateTime fromUtc,
        DateTime toUtcExclusive,
        int workloadLimit,
        CancellationToken ct = default)
    {
        var shipments = db.Shipments.AsNoTracking();
        var drivers = db.Drivers.AsNoTracking();

        var shipmentStats = await shipments
            .GroupBy(s => 1)
            .Select(g => new
            {
                Total = g.Count(),
                Active = g.Count(s => s.Status == ShipmentStatus.Assigned || s.Status == ShipmentStatus.InTransit),
                Delivered = g.Count(s => s.Status == ShipmentStatus.Delivered)
            })
            .FirstOrDefaultAsync(ct);

        var totalShipments = shipmentStats?.Total ?? 0;
        var activeShipments = shipmentStats?.Active ?? 0;
        var deliveredShipments = shipmentStats?.Delivered ?? 0;

        var driverStats = await drivers
            .GroupBy(d => 1)
            .Select(g => new
            {
                Active = g.Count(d => d.Status == DriverStatus.OnDuty),
                Available = g.Count(d => d.Status == DriverStatus.Available)
            })
            .FirstOrDefaultAsync(ct);

        var activeDrivers = driverStats?.Active ?? 0;
        var availableDrivers = driverStats?.Available ?? 0;

        var shipmentsOverTime = await shipments
            .Where(shipment => shipment.CreatedAtUtc >= fromUtc && shipment.CreatedAtUtc < toUtcExclusive)
            .GroupBy(shipment => shipment.CreatedAtUtc.Date)
            .Select(group => new AnalyticsShipmentTrendPoint(group.Key, group.Count()))
            .ToListAsync(ct);

        var deliveryDurations = await shipments
            .Where(shipment => shipment.StartedAtUtc.HasValue && shipment.DeliveredAtUtc.HasValue)
            .Select(shipment => new
            {
                StartedAtUtc = shipment.StartedAtUtc!.Value,
                DeliveredAtUtc = shipment.DeliveredAtUtc!.Value,
            })
            .ToListAsync(ct);

        var workloadRows = await shipments
            .Where(s => s.Status == ShipmentStatus.Assigned || s.Status == ShipmentStatus.InTransit)
            .Select(s => new
            {
                DriverName = s.Driver != null ? s.Driver.Employee.Name : "Unassigned",
                s.Status
            })
            .ToListAsync(ct);

        var averageDeliveryHours = deliveryDurations.Count == 0
            ? (double?)null
            : deliveryDurations.Average(item => (item.DeliveredAtUtc - item.StartedAtUtc).TotalHours);

        var driverWorkload = workloadRows
            .GroupBy(item => item.DriverName)
            .Select(group =>
            {
                var assigned = group.Count(item => item.Status == ShipmentStatus.Assigned);
                var inTransit = group.Count(item => item.Status == ShipmentStatus.InTransit);

                return new AnalyticsDriverWorkloadPoint(
                    DriverName: group.Key,
                    Assigned: assigned,
                    InTransit: inTransit,
                    Total: assigned + inTransit);
            })
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
