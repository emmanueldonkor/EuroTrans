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

    public async Task<Shipment?> GetByIdAsync(Guid id)
    {
        return await db.Shipments
            .Include(s => s.Activities)
            .Include(s => s.Milestones)
            .Include(s => s.Documents)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task AddAsync(Shipment shipment)
    {
        await db.Shipments.AddAsync(shipment);
    }

    public async Task<List<Shipment>> GetFilteredAsync(
        ShipmentStatus? status,
        Guid? driverId,
        DateTime? startDate,
        DateTime? endDate,
        string? search)
    {
        var query = db.Shipments.AsQueryable();

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

        return await query.ToListAsync();
    }
}
