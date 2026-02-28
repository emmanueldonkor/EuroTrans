using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks.GetTrucks;

public class GetTrucksService
{
    private readonly ITruckRepository trucks;
    private readonly IQueryCache cache;

    public GetTrucksService(ITruckRepository trucks, IQueryCache cache)
    {
        this.trucks = trucks;
        this.cache = cache;
    }

    public async Task<ErrorOr<List<Truck>>> GetAsync(CancellationToken ct = default)
    {
        var version = cache.GetVersion(QueryCacheScopes.Trucks);
        var key = $"trucks:list:v{version}";

        return await cache.GetOrCreateAsync(
            key,
            QueryCacheTtls.Trucks,
            async token =>
            {
                var data = await trucks.GetAllAsync(token);
                return (ErrorOr<List<Truck>>)data;
            },
            ct);
    }
}
