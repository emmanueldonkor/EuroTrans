using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Trucks;

namespace EuroTrans.Application.features.Shipments.CancelShipment;

public class CancelShipmentService
{
    private readonly IShipmentRepository shipments;
    private readonly IEmployeeRepository drivers;
    private readonly ITruckRepository trucks;
    private readonly IUnitOfWork uow;
    private readonly ICurrentUser currentUser;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;

    public CancelShipmentService(
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

    public async Task<ErrorOr<Success>> CancelAsync(Guid shipmentId, CancellationToken ct = default)
    {

        if (!currentUser.IsManager)
            return Error.Forbidden(description: "Only managers can cancel shipments.");

        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
            return employeeIdResult.Errors;

        var shipment = await shipments.GetByIdAsync(shipmentId, ct);
        if (shipment is null)
            return Error.NotFound(description: "Shipment not found.");

        var cancelResult = shipment.Cancel(employeeIdResult.Value, clock.UtcNow);

        if (cancelResult.IsError)
            return cancelResult.Errors;

        if (shipment.DriverId.HasValue)
        {
            var driver = await drivers.GetByIdAsync(shipment.DriverId.Value, ct);
            driver?.Driver?.SetAvailable();
        }

        if (shipment.TruckId.HasValue)
        {
            var truck = await trucks.GetByIdAsync(shipment.TruckId.Value, ct);
            truck?.MarkAvailable();
        }

        await uow.SaveChangesAsync(ct);
        return Result.Success;
    }
}
