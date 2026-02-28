using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Application.features.Employees.Drivers.GetDriver;

public class GetDriverService
{
    private readonly IEmployeeRepository employees;
    private readonly IQueryCache cache;

    public GetDriverService(IEmployeeRepository employees, IQueryCache cache)
    {
        this.employees = employees;
        this.cache = cache;
    }

    public async Task<ErrorOr<GetDriverResponse>> GetAsync(Guid id, CancellationToken ct = default)
    {
        var version = cache.GetVersion(QueryCacheScopes.Drivers);
        var key = $"drivers:item:{id}:v{version}";

        return await cache.GetOrCreateAsync<ErrorOr<GetDriverResponse>>(
            key,
            QueryCacheTtls.Drivers,
            async token =>
            {
                var employee = await employees.GetByIdAsync(id, token);

                if (employee is null)
                    return Error.NotFound(description: "Driver not found.");

                if (employee.Role != EmployeeRole.Driver)
                    return Error.Validation(description: "Employee is not a driver.");

                if (employee.Driver == null)
                    return Error.Unexpected(description: "Driver profile missing.");

                return new GetDriverResponse(
                    EmployeeId: employee.Id,
                    Name: employee.Name,
                    Email: employee.Email,
                    AvatarUrl: employee.AvatarUrl,
                    Phone: employee.Driver.Phone,
                    IsActive: employee.IsActive,
                    CreatedAtUtc: employee.CreatedAtUtc,
                    LicenseNumber: employee.Driver.LicenseNumber,
                    Status: employee.Driver.Status
                );
            },
            ct);
    }
}
