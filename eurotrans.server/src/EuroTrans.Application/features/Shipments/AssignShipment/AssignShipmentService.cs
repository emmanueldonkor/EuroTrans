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
    private readonly ICurrentUser currentUser;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;

    public AssignShipmentService(
        IShipmentRepository shipments,
        IEmployeeRepository drivers,
        ITruckRepository trucks,
        IUnitOfWork uow,
        ICurrentUser currentUser,
        ICurrentEmployeeProvider currentEmployeeProvider,
        IDateTimeProvider clock)
    {
        this.shipments = shipments;
        this.drivers = drivers;
        this.trucks = trucks;
        this.uow = uow;
        this.currentUser = currentUser;
        this.currentEmployeeProvider = currentEmployeeProvider;
        this.clock = clock;
    }

    public async Task<ErrorOr<Success>> AssignAsync(Guid shipmentId, AssignShipmentRequest request, CancellationToken ct = default)
    {
        if (!currentUser.IsManager)
            return Error.Forbidden(description: "Only managers can assign shipments.");

        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
            return employeeIdResult.Errors;

        var shipment = await shipments.GetByIdAsync(shipmentId, ct);
        if (shipment is null) return Error.NotFound(description: "Shipment not found.");

        var driver = await drivers.GetByIdAsync(request.DriverId, ct);
        if (driver is null) return Error.NotFound(description: "Driver not found.");

        var truck = await trucks.GetByIdAsync(request.TruckId, ct);
        if (truck is null) return Error.NotFound(description: "Truck not found.");

        // 3. Business Rule Checks
        if (driver.Driver?.Status != DriverStatus.Available)
            return Error.Conflict(description: "Driver is not available.");

        if (truck.Status != TruckStatus.Available)
            return Error.Conflict(description: "Truck is not available.");

        var result = shipment.Assign(employeeIdResult.Value, driver.Id, truck.Id, clock.UtcNow);

        if (result.IsError) return result.Errors;

        driver.Driver.SetOnDuty();
        truck.MarkInUse();

        await uow.SaveChangesAsync(ct);

        return Result.Success;
    }
}