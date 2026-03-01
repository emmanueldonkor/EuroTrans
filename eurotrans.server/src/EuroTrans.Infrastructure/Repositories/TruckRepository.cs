using EuroTrans.Application.features.Trucks;
using EuroTrans.Domain.Trucks;
using EuroTrans.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EuroTrans.Infrastructure.Repositories;

public class TruckRepository : ITruckRepository
{
    private readonly AppDbContext db;

    public TruckRepository(AppDbContext db)
    {
        this.db = db;
    }

    public async Task<Truck?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await db.Trucks.FirstOrDefaultAsync(t => t.Id == id && t.IsActive, ct);
    }

    public async Task<List<Truck>> GetAllAsync(CancellationToken ct = default)
    {
        return await db.Trucks
            .AsNoTracking()
            .Where(t => t.IsActive)
            .ToListAsync(ct);
    }

    public async Task<(List<Truck> Items, int TotalCount)> GetPagedAsync(
        string? search,
        TruckStatus? status,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var query = db.Trucks
            .AsNoTracking()
            .Where(t => t.IsActive);

        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(t =>
                EF.Functions.ILike(t.PlateNumber, pattern) ||
                EF.Functions.ILike(t.Model, pattern));
        }

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderBy(t => t.PlateNumber)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task AddAsync(Truck truck, CancellationToken ct = default)
    {
        await db.Trucks.AddAsync(truck, ct);
    }

    public Task UpdateAsync(Truck truck, CancellationToken ct = default)
    {
        db.Trucks.Update(truck);
        return Task.CompletedTask;
    }
}
