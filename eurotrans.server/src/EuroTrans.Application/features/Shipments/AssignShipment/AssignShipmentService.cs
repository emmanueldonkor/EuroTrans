using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Trucks;
using EuroTrans.Domain.Employees.Enums;
using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Shipments.AssignShipment;

public class AssignShipmentService
{
    private readonly IShipmentRepository shipments;
    private readonly IEmployeeRepository drivers;
    private readonly ITruckRepository trucks;
    private readonly IUnitOfWork uow;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;

    public AssignShipmentService(
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

    public async Task<ErrorOr<Success>> AssignAsync(Guid shipmentId, AssignShipmentRequest request, CancellationToken ct = default)
    {
        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
            return employeeIdResult.Errors;

        // Load shipment
        var shipment = await shipments.GetByIdAsync(shipmentId, ct);
        if (shipment is null) return Error.NotFound("Shipment not found.");

        // Load driver
        var driver = await drivers.GetByIdAsync(request.DriverId, ct);
        if (driver is null) return Error.NotFound("Driver not found.");
        if (driver.Driver is null) return Error.Validation("Selected employee does not have a driver profile.");
        if (driver.Driver.Status != DriverStatus.Available)
            return Error.Conflict("Driver is not available.");

        // Load truck
        var truck = await trucks.GetByIdAsync(request.TruckId, ct);
        if (truck is null) return Error.NotFound("Truck not found.");
        if (truck.Status != TruckStatus.Available)
            return Error.Conflict("Truck is not available.");

        // Assign shipment (domain rules)
        var result = shipment.Assign(employeeIdResult.Value, driver.Id, truck.Id, clock.UtcNow);
        if (result.IsError) return result.Errors;

        // Update driver/truck state
        driver.Driver.SetOnDuty();
        truck.MarkInUse();

        // Save changes via UnitOfWork (repository handles concurrency)
        var saveResult = await uow.SaveChangesWithConcurrencyCheckAsync(ct);
        if (saveResult.IsError)
            return saveResult.Errors;

        return Result.Success;
    }
}