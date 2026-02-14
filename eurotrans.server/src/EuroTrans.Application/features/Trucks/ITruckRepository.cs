using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks;

public interface ITruckRepository
{
    Task<Truck?> GetByIdAsync(Guid id);
    Task<List<Truck>> GetAllAsync();
    Task AddAsync(Truck truck);
    Task UpdateAsync(Truck truck);
    Task DeleteAsync(Truck truck);
}
