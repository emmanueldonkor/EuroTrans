using EuroTrans.Application.features.Shipments;
using EuroTrans.Application.features.Shipments.GetShipments;
using EuroTrans.Application.features.Shipments.Tracking;
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

    public Task<Shipment?> GetForTrackingAsync(Guid id, CancellationToken ct = default)
    {
        return db.Shipments.FirstOrDefaultAsync(s => s.Id == id, ct);
    }

    public Task<CurrentDriverShipmentQueryItem?> GetCurrentForDriverAsync(Guid driverId, CancellationToken ct = default)
    {
        return db.Shipments
            .AsNoTracking()
            .Where(s => s.DriverId == driverId)
            .Where(s => s.Status == ShipmentStatus.InTransit || s.Status == ShipmentStatus.Assigned)
            .OrderBy(s => s.Status == ShipmentStatus.InTransit ? 0 : 1)
            .ThenByDescending(s => s.UpdatedAtUtc ?? s.CreatedAtUtc)
            .Select(s => new CurrentDriverShipmentQueryItem(
                s.Id,
                s.TrackingId,
                s.Status,
                s.Cargo.Description,
                s.Cargo.Weight,
                s.Cargo.Volume,
                s.OriginAddress.AddressLine,
                s.OriginAddress.City,
                s.OriginAddress.Country,
                s.OriginAddress.PostalCode,
                s.DestinationAddress.AddressLine,
                s.DestinationAddress.City,
                s.DestinationAddress.Country,
                s.DestinationAddress.PostalCode
            ))
            .FirstOrDefaultAsync(ct);
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

    public async Task<(List<ShipmentLivePinQueryItem> Items, int TotalCount)> GetLivePinItemsPagedAsync(
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var query = db.Shipments
            .AsNoTracking()
            .Where(s => s.Status == ShipmentStatus.InTransit)
            .Where(s => s.Milestones.Any(m => m.Type == MilestoneType.LocationUpdate));

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(s => s.Milestones
                .Where(m => m.Type == MilestoneType.LocationUpdate)
                .Select(m => (DateTime?)m.TimestampUtc)
                .Max())
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new ShipmentLivePinQueryItem(
                s.Id,
                s.TrackingId,
                s.Driver != null ? s.Driver.Employee.Name : null,
                s.Cargo.Description,
                s.Status,
                s.Milestones
                    .Where(m => m.Type == MilestoneType.LocationUpdate)
                    .OrderByDescending(m => m.TimestampUtc)
                    .Select(m => (double?)m.LocationLat)
                    .FirstOrDefault(),
                s.Milestones
                    .Where(m => m.Type == MilestoneType.LocationUpdate)
                    .OrderByDescending(m => m.TimestampUtc)
                    .Select(m => (double?)m.LocationLng)
                    .FirstOrDefault(),
                s.Milestones
                    .Where(m => m.Type == MilestoneType.LocationUpdate)
                    .OrderByDescending(m => m.TimestampUtc)
                    .Select(m => (DateTime?)m.TimestampUtc)
                    .FirstOrDefault()))
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task<(List<GetShipmentsQueryItem> Items, int TotalCount)> GetFilteredAsync(
    ShipmentStatus? status,
    Guid? driverId,
    DateTime? startDate,
    DateTime? endDate,
    string? search,
    bool? hasProofOfDelivery,
    int page,
    int pageSize,
    CancellationToken ct = default)
    {
        var query = db.Shipments
            .AsNoTracking()
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

        if (hasProofOfDelivery.HasValue)
        {
            query = hasProofOfDelivery.Value
                ? query.Where(s => s.Documents.Any(d => d.Type == DocumentType.ProofOfDelivery))
                : query.Where(s => !s.Documents.Any(d => d.Type == DocumentType.ProofOfDelivery));
        }

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(s => s.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new GetShipmentsQueryItem(
                s.Id,
                s.TrackingId,
                s.Status,
                s.Driver != null ? s.Driver.Employee.Name : null,
                s.OriginAddress != null ? s.OriginAddress.City : null,
                s.OriginAddress != null ? s.OriginAddress.Country : null,
                s.DestinationAddress != null ? s.DestinationAddress.City : null,
                s.DestinationAddress != null ? s.DestinationAddress.Country : null,
                s.UpdatedAtUtc,
                s.DeliveredAtUtc,
                s.Documents
                    .Where(d => d.Type == DocumentType.ProofOfDelivery)
                    .OrderByDescending(d => d.UploadedAtUtc)
                    .Select(d => d.Url)
                    .FirstOrDefault()
            ))
            .ToListAsync(ct);

        return (items, totalCount);
    }

}
