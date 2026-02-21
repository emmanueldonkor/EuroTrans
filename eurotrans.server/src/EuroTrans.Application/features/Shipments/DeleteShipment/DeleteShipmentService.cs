using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Trucks;

namespace EuroTrans.Application.features.Shipments.DeleteShipment;

public class DeleteShipmentService
{
    private readonly IShipmentRepository shipments;
    private readonly IEmployeeRepository drivers;
    private readonly ITruckRepository trucks;
    private readonly IUnitOfWork uow;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;

    public DeleteShipmentService(
        IShipmentRepository shipments,
        IEmployeeRepository drivers,
        ITruckRepository trucks,
        IUnitOfWork uow,
        ICurrentEmployeeProvider currentEmployeeProvider,
        IDateTimeProvider clock)
    {
        this.shipments = shipments;
        this.drivers = drivers;
        this.trucks = trucks;
        this.uow = uow;
        this.currentEmployeeProvider = currentEmployeeProvider;
        this.clock = clock;
    }

    public async Task<ErrorOr<Success>> DeleteAsync(Guid shipmentId, CancellationToken ct = default)
    {
        if (shipmentId == Guid.Empty)
            return Error.Validation("ShipmentId.Invalid", "Shipment ID cannot be empty.");

        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
            return employeeIdResult.Errors;

        var shipment = await shipments.GetByIdAsync(shipmentId, ct);
        if (shipment is null)
            return Error.NotFound("Shipment not found.");

        // Domain handles rules & activities
        var deleteResult = shipment.Delete(employeeIdResult.Value, clock.UtcNow);
        if (deleteResult.IsError)
            return deleteResult.Errors;

        // Release driver if assigned
        if (shipment.DriverId.HasValue)
        {
            var driver = await drivers.GetByIdAsync(shipment.DriverId.Value, ct);
            if (driver?.Driver is null)
                return Error.NotFound("Assigned driver not found.");

            driver.Driver.SetAvailable();
        }

        // Release truck if assigned
        if (shipment.TruckId.HasValue)
        {
            var truck = await trucks.GetByIdAsync(shipment.TruckId.Value, ct);
            if (truck is null)
                return Error.NotFound("Assigned truck not found.");

            truck.MarkAvailable();
        }

        // Save changes with concurrency check
        var saveResult = await uow.SaveChangesWithConcurrencyCheckAsync(ct);
        if (saveResult.IsError)
            return saveResult.Errors;

        return Result.Success;
    }
}