using ErrorOr;
using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks.UpdateTruck;

public class UpdateTruckStatusService
{
    private readonly ITruckRepository trucks;
    private readonly IUnitOfWork uow;

    public UpdateTruckStatusService(ITruckRepository trucks, IUnitOfWork uow)
    {
        this.trucks = trucks;
        this.uow = uow;
    }

    public async Task<ErrorOr<Success>> UpdateAsync(Guid id, TruckStatus status, CancellationToken ct = default)
    {
        var truck = await trucks.GetByIdAsync(id, ct);

        if (truck is null)
            return Error.NotFound(description: "Truck not found.");

        truck.SetStatus(status);

        await uow.SaveChangesAsync(ct);

        return Result.Success;
    }
}
