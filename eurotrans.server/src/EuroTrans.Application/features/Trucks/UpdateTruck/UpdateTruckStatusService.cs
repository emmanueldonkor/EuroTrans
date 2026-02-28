using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks.UpdateTruck;

public class UpdateTruckStatusService
{
    private readonly ILogger<UpdateTruckStatusService> logger;
    private readonly ITruckRepository trucks;
    private readonly IUnitOfWork uow;
    private readonly IQueryCache cache;

    public UpdateTruckStatusService(
        ILogger<UpdateTruckStatusService> logger,
        ITruckRepository trucks,
        IUnitOfWork uow,
        IQueryCache cache)
    {
        this.logger = logger;
        this.trucks = trucks;
        this.uow = uow;
        this.cache = cache;
    }

    public async Task<ErrorOr<Success>> UpdateAsync(Guid id, TruckStatus status, CancellationToken ct = default)
    {
        logger.LogInformation("Update truck status requested. TruckId: {TruckId}, NewStatus: {Status}", id, status);

        var truck = await trucks.GetByIdAsync(id, ct);

        if (truck is null)
        {
            logger.LogWarning("Update truck status failed. Truck not found. TruckId: {TruckId}", id);
            return Error.NotFound(description: "Truck not found.");
        }

        var result = truck.SetStatus(status);
        if (result.IsError)
        {
            logger.LogWarning("Update truck status rejected by domain rules. TruckId: {TruckId}, NewStatus: {Status}", id, status);
            return result.Errors;
        }

        var saveResult = await uow.SaveChangesWithConcurrencyCheckAsync(ct);
        if (saveResult.IsError)
        {
            logger.LogWarning("Update truck status failed during persistence. TruckId: {TruckId}", id);
            return saveResult.Errors;
        }

        cache.BumpVersion(QueryCacheScopes.Trucks);

        logger.LogInformation("Truck status updated successfully. TruckId: {TruckId}, NewStatus: {Status}", id, status);

        return Result.Success;
    }
}
