using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks.UpdateTruck;

public class UpdateTruckStatusService
{
    private readonly ITruckRepository trucks;
    private readonly IUnitOfWork uow;
    private readonly IQueryCache cache;

    public UpdateTruckStatusService(ITruckRepository trucks, IUnitOfWork uow, IQueryCache cache)
    {
        this.trucks = trucks;
        this.uow = uow;
        this.cache = cache;
    }

    public async Task<ErrorOr<Success>> UpdateAsync(Guid id, TruckStatus status, CancellationToken ct = default)
    {
        var truck = await trucks.GetByIdAsync(id, ct);

        if (truck is null)
            return Error.NotFound(description: "Truck not found.");

        var result = truck.SetStatus(status);
        if (result.IsError)
            return result.Errors;

        var saveResult = await uow.SaveChangesWithConcurrencyCheckAsync(ct);
        if (saveResult.IsError)
            return saveResult.Errors;

        cache.BumpVersion(QueryCacheScopes.Trucks);

        return Result.Success;
    }
}
