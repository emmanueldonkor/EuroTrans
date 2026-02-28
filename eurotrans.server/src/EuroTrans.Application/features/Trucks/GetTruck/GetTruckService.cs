using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks.GetTruck;

public class GetTruckService
{
    private readonly ITruckRepository trucks;
    private readonly IQueryCache cache;

    public GetTruckService(ITruckRepository trucks, IQueryCache cache)
    {
        this.trucks = trucks;
        this.cache = cache;
    }

    public async Task<ErrorOr<Truck>> GetAsync(Guid id, CancellationToken ct = default)
    {
        var version = cache.GetVersion(QueryCacheScopes.Trucks);
        var key = $"trucks:item:{id}:v{version}";

        return await cache.GetOrCreateAsync(
            key,
            QueryCacheTtls.Trucks,
            async token =>
            {
                var truck = await trucks.GetByIdAsync(id, token);
                if (truck is null)
                    return Error.NotFound(description: "Truck not found.");

                return (ErrorOr<Truck>)truck;
            },
            ct);
    }
}
