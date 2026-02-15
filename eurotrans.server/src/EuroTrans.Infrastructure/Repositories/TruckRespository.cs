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
        return await db.Trucks.FirstOrDefaultAsync(t => t.Id == id, ct);
    }

    public async Task<List<Truck>> GetAllAsync(CancellationToken ct = default)
    {
        return await db.Trucks.ToListAsync(ct);
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
    public Task DeleteAsync(Truck truck, CancellationToken ct = default)
    {
        db.Trucks.Remove(truck);
        return Task.CompletedTask;
    }

}
