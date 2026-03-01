using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;

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

    public async Task<ErrorOr<GetTrucksResponse>> GetAsync(GetTrucksRequest request, CancellationToken ct = default)
    {
        var version = cache.GetVersion(QueryCacheScopes.Trucks);
        var key = string.Join(":",
            $"trucks:list:v{version}",
            $"search={QueryCacheKey.Segment(request.Search)}",
            $"status={request.Status?.ToString().ToLowerInvariant() ?? "_"}",
            $"page={request.Page}",
            $"size={request.PageSize}");

        return await cache.GetOrCreateAsync(
            key,
            QueryCacheTtls.Trucks,
            async token =>
            {
                var (items, totalCount) = await trucks.GetPagedAsync(
                    request.Search,
                    request.Status,
                    request.Page,
                    request.PageSize,
                    token);

                return (ErrorOr<GetTrucksResponse>)new GetTrucksResponse(
                    Items: items,
                    TotalCount: totalCount,
                    Page: request.Page,
                    PageSize: request.PageSize
                );
            },
            ct);
    }
}
