using EuroTrans.Application.features.Shipments;
using EuroTrans.Application.features.Shipments.GetShipments;
using EuroTrans.Domain.Shipments;
using EuroTrans.Domain.Shipments.Enums;
using EuroTrans.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EuroTrans.Infrastructure.Repositories;

public class ShipmentRepository : IShipmentRepository
{
    private readonly AppDbContext db;
    private static readonly ShipmentStatus[] ActiveStatuses =
    [
        ShipmentStatus.Assigned,
        ShipmentStatus.InTransit
    ];

    public ShipmentRepository(AppDbContext db)
    {
        this.db = db;
    }

    public async Task<Shipment?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await db.Shipments
             .AsSplitQuery()
            .Include(s => s.Driver!)
                    .ThenInclude(e => e.Employee)
            .Include(s => s.Truck)
            .Include(s => s.Activities)
                   .ThenInclude(a => a.Employee)
            .Include(s => s.Documents)
            .Include(s => s.Milestones)
                   .ThenInclude(s => s.Employee)
            .FirstOrDefaultAsync(s => s.Id == id, ct);
    }

    public async Task AddAsync(Shipment shipment, CancellationToken ct = default)
    {
        await db.Shipments.AddAsync(shipment, ct);
    }

    public Task<bool> HasActiveAssignmentForDriverAsync(Guid driverId, CancellationToken ct = default)
    {
        return db.Shipments
            .AsNoTracking()
            .AnyAsync(s => s.DriverId == driverId && ActiveStatuses.Contains(s.Status), ct);
    }

    public Task<bool> HasActiveAssignmentForTruckAsync(Guid truckId, CancellationToken ct = default)
    {
        return db.Shipments
            .AsNoTracking()
            .AnyAsync(s => s.TruckId == truckId && ActiveStatuses.Contains(s.Status), ct);
    }

    public async Task<(List<GetShipmentsItemResponse> Items, int TotalCount)> GetFilteredAsync(
    ShipmentStatus? status,
    Guid? driverId,
    DateTime? startDate,
    DateTime? endDate,
    string? search,
    int page,
    int pageSize,
    CancellationToken ct = default)
    {
        var query = db.Shipments
            .AsNoTracking()
            .Include(s => s.Driver)
                .ThenInclude(d => d!.Employee)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(s => s.Status == status);

        if (driverId.HasValue)
            query = query.Where(s => s.DriverId == driverId);

        if (startDate.HasValue)
            query = query.Where(s => s.CreatedAtUtc >= startDate);

        if (endDate.HasValue)
            query = query.Where(s => s.CreatedAtUtc <= endDate);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(s =>
                s.TrackingId.Contains(search) ||
                s.Cargo != null && s.Cargo.Description.Contains(search));

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(s => s.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new GetShipmentsItemResponse(
                s.Id,
                s.TrackingId,
                s.Status,
                s.Driver != null ? s.Driver.Employee.Name : null,
                s.OriginAddress != null
                    ? $"{s.OriginAddress.City}, {s.OriginAddress.Country}"
                    : "Unknown",
                s.DestinationAddress != null
                    ? $"{s.DestinationAddress.City}, {s.DestinationAddress.Country}"
                    : "Unknown",
                s.UpdatedAtUtc
            ))
            .ToListAsync(ct);

        return (items, totalCount);
    }

}
