using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Shipments;
using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Application.features.Employees.Drivers.UpdateDriverStatus;

public class UpdateDriverStatusService
{
    private readonly ILogger<UpdateDriverStatusService> logger;
    private readonly IEmployeeRepository employees;
    private readonly IShipmentRepository shipments;
    private readonly IUnitOfWork uow;
    private readonly IQueryCache cache;

    public UpdateDriverStatusService(
        ILogger<UpdateDriverStatusService> logger,
        IEmployeeRepository employees,
        IShipmentRepository shipments,
        IUnitOfWork uow,
        IQueryCache cache)
    {
        this.logger = logger;
        this.employees = employees;
        this.shipments = shipments;
        this.uow = uow;
        this.cache = cache;
    }

    public async Task<ErrorOr<Success>> UpdateAsync(Guid employeeId, DriverStatus status, CancellationToken ct = default)
    {
        logger.LogInformation("Update driver status requested. EmployeeId: {EmployeeId}, NewStatus: {Status}", employeeId, status);

        var employee = await employees.GetByIdAsync(employeeId, ct);
        if (employee is null)
        {
            logger.LogWarning("Update driver status failed. Driver not found. EmployeeId: {EmployeeId}", employeeId);
            return Error.NotFound(description: "Driver not found.");
        }

        if (employee.Driver is null)
        {
            logger.LogWarning("Update driver status failed. Employee is not a driver. EmployeeId: {EmployeeId}", employeeId);
            return Error.Validation(description: "Employee is not a driver.");
        }

        var hasActiveAssignment = await shipments.HasActiveAssignmentForDriverAsync(employeeId, ct);
        if (hasActiveAssignment)
        {
            logger.LogWarning("Update driver status rejected. Driver has active assignment. EmployeeId: {EmployeeId}", employeeId);
            return Error.Conflict(description: "Driver status cannot be changed while assigned to an active shipment.");
        }

        employee.Driver.SetStatus(status);
        await employees.UpdateAsync(employee, ct);
        var saveResult = await uow.SaveChangesWithConcurrencyCheckAsync(ct);
        if (saveResult.IsError)
        {
            logger.LogWarning("Update driver status failed during persistence. EmployeeId: {EmployeeId}", employeeId);
            return saveResult.Errors;
        }

        cache.BumpVersion(QueryCacheScopes.Drivers);
        cache.BumpVersion(QueryCacheScopes.Shipments);

        logger.LogInformation("Driver status updated successfully. EmployeeId: {EmployeeId}, NewStatus: {Status}", employeeId, status);

        return Result.Success;
    }
}
