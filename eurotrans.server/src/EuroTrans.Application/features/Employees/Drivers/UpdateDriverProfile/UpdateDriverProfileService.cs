using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;

namespace EuroTrans.Application.features.Employees.Drivers.UpdateDriverProfile;

public class UpdateDriverProfileService
{
    private readonly ILogger<UpdateDriverProfileService> logger;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IEmployeeRepository employees;
    private readonly IUnitOfWork uow;
    private readonly IQueryCache cache;

    public UpdateDriverProfileService(
        ILogger<UpdateDriverProfileService> logger,
        ICurrentEmployeeProvider currentEmployeeProvider,
        IEmployeeRepository employees,
        IUnitOfWork uow,
        IQueryCache cache)
    {
        this.logger = logger;
        this.currentEmployeeProvider = currentEmployeeProvider;
        this.employees = employees;
        this.uow = uow;
        this.cache = cache;
    }

    public async Task<ErrorOr<Success>> UpdateAsync(UpdateDriverProfileRequest request, CancellationToken ct = default)
    {
        logger.LogInformation("Update driver profile requested.");

        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
        {
            logger.LogWarning("Update driver profile denied due to missing current employee context.");
            return employeeIdResult.Errors;
        }

        var employee = await employees.GetByIdAsync(employeeIdResult.Value, ct);
        if (employee is null)
        {
            logger.LogWarning("Update driver profile failed. Driver not found. EmployeeId: {EmployeeId}", employeeIdResult.Value);
            return Error.NotFound(description: "Driver not found.");
        }

        if (employee.Driver is null)
        {
            logger.LogWarning("Update driver profile failed. Current employee is not a driver. EmployeeId: {EmployeeId}", employeeIdResult.Value);
            return Error.Forbidden(description: "Current employee is not a driver.");
        }

        employee.Driver.UpdateProfile(
            licenseNumber: request.LicenseNumber.Trim(),
            phone: request.Phone.Trim()
        );

        await employees.UpdateAsync(employee, ct);
        var saveResult = await uow.SaveChangesWithConcurrencyCheckAsync(ct);
        if (saveResult.IsError)
        {
            logger.LogWarning("Update driver profile failed during persistence. EmployeeId: {EmployeeId}", employeeIdResult.Value);
            return saveResult.Errors;
        }

        cache.BumpVersion(QueryCacheScopes.Drivers);
        cache.BumpVersion(QueryCacheScopes.Shipments);

        logger.LogInformation("Driver profile updated successfully. EmployeeId: {EmployeeId}", employeeIdResult.Value);

        return Result.Success;
    }
}
