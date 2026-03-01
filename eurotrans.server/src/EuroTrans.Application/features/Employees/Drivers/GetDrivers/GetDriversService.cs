using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Employees.Drivers.GetDrivers;

public class GetDriversService
{
    private readonly IEmployeeRepository employees;
    private readonly IQueryCache cache;

    public GetDriversService(IEmployeeRepository employees, IQueryCache cache)
    {
        this.employees = employees;
        this.cache = cache;
    }

    public async Task<ErrorOr<GetDriversPagedResponse>> GetAsync(GetDriversRequest request, CancellationToken ct = default)
    {
        var version = cache.GetVersion(QueryCacheScopes.Drivers);
        var key = string.Join(":",
            $"drivers:list:v{version}",
            $"search={QueryCacheKey.Segment(request.Search)}",
            $"status={request.Status?.ToString().ToLowerInvariant() ?? "_"}",
            $"page={request.Page}",
            $"size={request.PageSize}");

        return await cache.GetOrCreateAsync(
            key,
            QueryCacheTtls.Drivers,
            async token =>
            {
                var (drivers, totalCount) = await employees.GetDriversPagedAsync(
                    request.Search,
                    request.Status,
                    request.Page,
                    request.PageSize,
                    token);

                var items = drivers.Select(e => new GetDriversResponse(
                    EmployeeId: e.Id,
                    Name: e.Name,
                    Email: e.Email,
                    Phone: e.Driver?.Phone,
                    Status: e.Driver!.Status,
                    LicenseNumber: e.Driver?.LicenseNumber
                )).ToList();

                return (ErrorOr<GetDriversPagedResponse>)new GetDriversPagedResponse(
                    Items: items,
                    TotalCount: totalCount,
                    Page: request.Page,
                    PageSize: request.PageSize
                );
            },
            ct);
    }
}
