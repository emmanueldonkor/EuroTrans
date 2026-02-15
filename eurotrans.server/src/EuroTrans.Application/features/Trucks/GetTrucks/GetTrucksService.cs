using ErrorOr;
using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks.GetTrucks;

public class GetTrucksService
{
    private readonly ITruckRepository trucks;

    public GetTrucksService(ITruckRepository trucks)
    {
        this.trucks = trucks;
    }

    public async Task<ErrorOr<List<Truck>>> GetAsync(CancellationToken ct = default)
    {
        return await trucks.GetAllAsync(ct);
    }
}
