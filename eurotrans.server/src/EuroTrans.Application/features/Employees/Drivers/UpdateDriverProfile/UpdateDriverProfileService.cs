using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;

namespace EuroTrans.Application.features.Employees.Drivers.UpdateDriverProfile;

public class UpdateDriverProfileService
{
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IEmployeeRepository employees;
    private readonly IUnitOfWork uow;

    public UpdateDriverProfileService(
        ICurrentEmployeeProvider currentEmployeeProvider,
        IEmployeeRepository employees,
        IUnitOfWork uow)
    {
        this.currentEmployeeProvider = currentEmployeeProvider;
        this.employees = employees;
        this.uow = uow;
    }

    public async Task<ErrorOr<Success>> UpdateAsync(UpdateDriverProfileRequest request, CancellationToken ct = default)
    {
        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
            return employeeIdResult.Errors;

        var employee = await employees.GetByIdAsync(employeeIdResult.Value, ct);
        if (employee is null)
            return Error.NotFound(description: "Driver not found.");

        if (employee.Driver is null)
            return Error.Forbidden(description: "Current employee is not a driver.");

        employee.Driver.UpdateProfile(
            licenseNumber: request.LicenseNumber.Trim(),
            phone: request.Phone.Trim()
        );

        await employees.UpdateAsync(employee, ct);
        var saveResult = await uow.SaveChangesWithConcurrencyCheckAsync(ct);
        if (saveResult.IsError)
            return saveResult.Errors;

        return Result.Success;
    }
}
