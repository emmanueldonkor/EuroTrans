using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Shipments;
using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks.DeleteTruck;

public class DeleteTruckService
{
    private readonly ITruckRepository trucks;
    private readonly IShipmentRepository shipments;
    private readonly IUnitOfWork uow;
    private readonly IQueryCache cache;

    public DeleteTruckService(ITruckRepository trucks, IShipmentRepository shipments, IUnitOfWork uow, IQueryCache cache)
    {
        this.trucks = trucks;
        this.shipments = shipments;
        this.uow = uow;
        this.cache = cache;
    }

    public async Task<ErrorOr<Deleted>> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var truck = await trucks.GetByIdAsync(id, ct);

        if (truck is null)
            return Error.NotFound(description: "Truck not found.");

        if (truck.Status == TruckStatus.InUse)
            return Error.Conflict(description: "Truck cannot be deleted while in use.");

        var hasActiveAssignment = await shipments.HasActiveAssignmentForTruckAsync(id, ct);
        if (hasActiveAssignment)
            return Error.Conflict(description: "Truck cannot be deleted while assigned to an active shipment.");

        var retireResult = truck.Retire();
        if (retireResult.IsError)
            return retireResult.Errors;

        await trucks.UpdateAsync(truck, ct);
        var saveResult = await uow.SaveChangesWithConcurrencyCheckAsync(ct);
        if (saveResult.IsError)
            return saveResult.Errors;

        cache.BumpVersion(QueryCacheScopes.Trucks);

        return Result.Deleted;
    }
}
