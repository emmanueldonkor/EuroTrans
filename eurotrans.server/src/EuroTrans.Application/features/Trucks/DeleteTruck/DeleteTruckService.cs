using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Shipments;
using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks.DeleteTruck;

public class DeleteTruckService
{
    private readonly ILogger<DeleteTruckService> logger;
    private readonly ITruckRepository trucks;
    private readonly IShipmentRepository shipments;
    private readonly IUnitOfWork uow;
    private readonly IQueryCache cache;

    public DeleteTruckService(
        ILogger<DeleteTruckService> logger,
        ITruckRepository trucks,
        IShipmentRepository shipments,
        IUnitOfWork uow,
        IQueryCache cache)
    {
        this.logger = logger;
        this.trucks = trucks;
        this.shipments = shipments;
        this.uow = uow;
        this.cache = cache;
    }

    public async Task<ErrorOr<Deleted>> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        logger.LogInformation("Delete truck requested. TruckId: {TruckId}", id);

        var truck = await trucks.GetByIdAsync(id, ct);

        if (truck is null)
        {
            logger.LogWarning("Delete truck failed. Truck not found. TruckId: {TruckId}", id);
            return Error.NotFound(description: "Truck not found.");
        }

        if (truck.Status == TruckStatus.InUse)
        {
            logger.LogWarning("Delete truck rejected. Truck is in use. TruckId: {TruckId}", id);
            return Error.Conflict(description: "Truck cannot be deleted while in use.");
        }

        var hasActiveAssignment = await shipments.HasActiveAssignmentForTruckAsync(id, ct);
        if (hasActiveAssignment)
        {
            logger.LogWarning("Delete truck rejected. Truck has active assignments. TruckId: {TruckId}", id);
            return Error.Conflict(description: "Truck cannot be deleted while assigned to an active shipment.");
        }

        var retireResult = truck.Retire();
        if (retireResult.IsError)
        {
            logger.LogWarning("Delete truck rejected by domain rules. TruckId: {TruckId}", id);
            return retireResult.Errors;
        }

        await trucks.UpdateAsync(truck, ct);
        var saveResult = await uow.SaveChangesWithConcurrencyCheckAsync(ct);
        if (saveResult.IsError)
        {
            logger.LogWarning("Delete truck failed during persistence. TruckId: {TruckId}", id);
            return saveResult.Errors;
        }

        cache.BumpVersion(QueryCacheScopes.Trucks);

        logger.LogInformation("Truck deleted successfully. TruckId: {TruckId}", id);

        return Result.Deleted;
    }
}
