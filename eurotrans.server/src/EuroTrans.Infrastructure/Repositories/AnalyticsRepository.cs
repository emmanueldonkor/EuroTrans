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

        var totalShipments = await shipments.CountAsync(ct);
        var activeShipments = await shipments.CountAsync(
            shipment => shipment.Status == ShipmentStatus.Assigned || shipment.Status == ShipmentStatus.InTransit,
            ct);
        var deliveredShipments = await shipments.CountAsync(
            shipment => shipment.Status == ShipmentStatus.Delivered,
            ct);
        var activeDrivers = await drivers.CountAsync(driver => driver.Status == DriverStatus.OnDuty, ct);
        var availableDrivers = await drivers.CountAsync(driver => driver.Status == DriverStatus.Available, ct);

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

        var workloadRows = await (
            from shipment in shipments
            join employee in db.Employees.AsNoTracking() on shipment.DriverId equals (Guid?)employee.Id into employees
            from employee in employees.DefaultIfEmpty()
            where shipment.Status == ShipmentStatus.Assigned || shipment.Status == ShipmentStatus.InTransit
            select new
            {
                DriverName = employee != null ? employee.Name : "Unassigned",
                shipment.Status,
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
