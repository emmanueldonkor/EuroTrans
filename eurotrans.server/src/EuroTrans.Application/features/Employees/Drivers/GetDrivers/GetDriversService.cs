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

    public async Task<ErrorOr<List<GetDriversResponse>>> GetAsync(CancellationToken ct = default)
    {
        var version = cache.GetVersion(QueryCacheScopes.Drivers);
        var key = $"drivers:list:v{version}";

        return await cache.GetOrCreateAsync(
            key,
            QueryCacheTtls.Drivers,
            async token =>
            {
                var drivers = await employees.GetDriversAsync(token);

                return (ErrorOr<List<GetDriversResponse>>)drivers.Select(e => new GetDriversResponse(
                    EmployeeId: e.Id,
                    Name: e.Name,
                    Email: e.Email,
                    Phone: e.Driver?.Phone,
                    Status: e.Driver!.Status,
                    LicenseNumber: e.Driver?.LicenseNumber
                )).ToList();
            },
            ct);
    }
}
