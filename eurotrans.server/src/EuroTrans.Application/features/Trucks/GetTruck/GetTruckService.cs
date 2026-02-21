using ErrorOr;
using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks.GetTruck;

public class GetTruckService
{
    private readonly ITruckRepository trucks;

    public GetTruckService(ITruckRepository trucks)
    {
        this.trucks = trucks;
    }

    public async Task<ErrorOr<Truck>> GetAsync(Guid id, CancellationToken ct = default)
    {
        var truck = await trucks.GetByIdAsync(id, ct);
        if (truck is null)
            return Error.NotFound(description: "Truck not found.");

        return truck;
    }
}
