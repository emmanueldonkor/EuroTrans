using ErrorOr;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Shipments;
using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Application.features.Employees.Drivers.UpdateDriverStatus;

public class UpdateDriverStatusService
{
    private readonly IEmployeeRepository employees;
    private readonly IShipmentRepository shipments;
    private readonly IUnitOfWork uow;

    public UpdateDriverStatusService(IEmployeeRepository employees, IShipmentRepository shipments, IUnitOfWork uow)
    {
        this.employees = employees;
        this.shipments = shipments;
        this.uow = uow;
    }

    public async Task<ErrorOr<Success>> UpdateAsync(Guid employeeId, DriverStatus status, CancellationToken ct = default)
    {
        var employee = await employees.GetByIdAsync(employeeId, ct);
        if (employee is null)
            return Error.NotFound(description: "Driver not found.");

        if (employee.Driver is null)
            return Error.Validation(description: "Employee is not a driver.");

        var hasActiveAssignment = await shipments.HasActiveAssignmentForDriverAsync(employeeId, ct);
        if (hasActiveAssignment)
            return Error.Conflict(description: "Driver status cannot be changed while assigned to an active shipment.");

        employee.Driver.SetStatus(status);
        await employees.UpdateAsync(employee, ct);
        var saveResult = await uow.SaveChangesWithConcurrencyCheckAsync(ct);
        if (saveResult.IsError)
            return saveResult.Errors;

        return Result.Success;
    }
}
