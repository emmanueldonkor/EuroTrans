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

    public async Task<Truck?> GetByIdAsync(Guid id)
    {
        return await db.Trucks.FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<List<Truck>> GetAllAsync()
    {
        return await db.Trucks.ToListAsync();
    }

    public async Task AddAsync(Truck truck)
    {
        await db.Trucks.AddAsync(truck);
    }

    public Task UpdateAsync(Truck truck)
    {
        db.Trucks.Update(truck);
        return Task.CompletedTask;
    }
    public Task DeleteAsync(Truck truck)
    {
        db.Trucks.Remove(truck);
        return Task.CompletedTask;
    }

}
