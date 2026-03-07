using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Trucks.GetTruckOptions;

public class GetTruckOptionsService
{
    private readonly ITruckRepository trucks;
    private readonly IQueryCache cache;

    public GetTruckOptionsService(ITruckRepository trucks, IQueryCache cache)
    {
        this.trucks = trucks;
        this.cache = cache;
    }

    public Task<ErrorOr<List<GetTruckOptionsResponse>>> GetAsync(CancellationToken ct = default)
    {
        var version = cache.GetVersion(QueryCacheScopes.Trucks);
        var key = $"trucks:options:v{version}";

        return cache.GetOrCreateAsync(
            key,
            QueryCacheTtls.Trucks,
            async token =>
            {
                var items = await trucks.GetOptionsAsync(token);

                return (ErrorOr<List<GetTruckOptionsResponse>>)items
                    .Select(truck => new GetTruckOptionsResponse(
                        Id: truck.Id,
                        PlateNumber: truck.PlateNumber,
                        Model: truck.Model,
                        Status: truck.Status))
                    .ToList();
            },
            ct);
    }
}
