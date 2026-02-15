using ErrorOr;
using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks.DeleteTruck;

public class DeleteTruckService
{
    private readonly ITruckRepository trucks;
    private readonly IUnitOfWork uow;

    public DeleteTruckService(ITruckRepository trucks, IUnitOfWork uow)
    {
        this.trucks = trucks;
        this.uow = uow;
    }

    public async Task<ErrorOr<Deleted>> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var truck = await trucks.GetByIdAsync(id, ct);
    
        if (truck is null)
            return Error.NotFound(description: "Truck not found.");

        if (truck.Status == TruckStatus.InUse)
            return Error.Conflict(description: "Truck cannot be deleted while in use.");

       await trucks.DeleteAsync(truck, ct);
       await uow.SaveChangesAsync(ct);

        return Result.Deleted;
    }
}