using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks;

public interface ITruckRepository
{
    Task<Truck?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<Truck>> GetAllAsync(CancellationToken ct = default);
    Task<(List<Truck> Items, int TotalCount)> GetPagedAsync(
        string? search,
        TruckStatus? status,
        int page,
        int pageSize,
        CancellationToken ct = default);
    Task AddAsync(Truck truck, CancellationToken ct = default);
    Task UpdateAsync(Truck truck, CancellationToken ct = default);
}
