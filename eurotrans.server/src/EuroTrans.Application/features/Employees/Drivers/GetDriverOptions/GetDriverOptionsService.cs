using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Employees.Drivers.GetDriverOptions;

public class GetDriverOptionsService
{
    private readonly IEmployeeRepository employees;
    private readonly IQueryCache cache;

    public GetDriverOptionsService(IEmployeeRepository employees, IQueryCache cache)
    {
        this.employees = employees;
        this.cache = cache;
    }

    public Task<ErrorOr<List<GetDriverOptionsResponse>>> GetAsync(CancellationToken ct = default)
    {
        var version = cache.GetVersion(QueryCacheScopes.Drivers);
        var key = $"drivers:options:v{version}";

        return cache.GetOrCreateAsync(
            key,
            QueryCacheTtls.Drivers,
            async token =>
            {
                var items = await employees.GetDriverOptionsAsync(token);

                return (ErrorOr<List<GetDriverOptionsResponse>>)items
                    .Select(driver => new GetDriverOptionsResponse(
                        EmployeeId: driver.EmployeeId,
                        Name: driver.Name,
                        Phone: driver.Phone,
                        Status: driver.Status))
                    .ToList();
            },
            ct);
    }
}
