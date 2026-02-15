using ErrorOr;
using EuroTrans.Application.features.Employees;
using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Application.features.Employees.Drivers.UpdateDriverStatus;

public class UpdateDriverStatusService
{
    private readonly IEmployeeRepository employees;
    private readonly IUnitOfWork uow;

    public UpdateDriverStatusService(IEmployeeRepository employees, IUnitOfWork uow)
    {
        this.employees = employees;
        this.uow = uow;
    }

    public async Task<ErrorOr<Success>> UpdateAsync(Guid employeeId, DriverStatus status, CancellationToken ct = default)
    {
        var employee = await employees.GetByIdAsync(employeeId, ct);
        if (employee is null)
            return Error.NotFound(description: "Driver not found.");

        if (employee.Driver is null)
            return Error.Validation(description: "Employee is not a driver.");

        employee.Driver.SetStatus(status);
        await employees.UpdateAsync(employee, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success;
    }
}
