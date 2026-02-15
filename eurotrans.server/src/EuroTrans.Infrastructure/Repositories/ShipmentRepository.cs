using EuroTrans.Application.features.Shipments;
using EuroTrans.Domain.Shipments;
using EuroTrans.Domain.Shipments.Enums;
using EuroTrans.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EuroTrans.Infrastructure.Repositories;

public class ShipmentRepository : IShipmentRepository
{
    private readonly AppDbContext db;

    public ShipmentRepository(AppDbContext db)
    {
        this.db = db;
    }

    public async Task<Shipment?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await db.Shipments
            .Include(s => s.Activities)
            .Include(s => s.Milestones)
            .Include(s => s.Documents)
            .FirstOrDefaultAsync(s => s.Id == id, ct);
    }

    public async Task AddAsync(Shipment shipment, CancellationToken ct = default)
    {
        await db.Shipments.AddAsync(shipment, ct);
    }

    public async Task<(List<Shipment> Items, int TotalCount)> GetFilteredAsync(
        ShipmentStatus? status,
        Guid? driverId,
        DateTime? startDate,
        DateTime? endDate,
        string? search,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var query = db.Shipments.AsNoTracking().AsQueryable();

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
                s.Cargo!.Description.Contains(search));

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(s => s.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }
}
