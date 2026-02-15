using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Trucks;

namespace EuroTrans.Application.features.Shipments.DeliverShipment;

public class DeliverShipmentService
{
    private readonly IShipmentRepository shipments;
    private readonly IEmployeeRepository drivers;
    private readonly ITruckRepository trucks;
    private readonly IUnitOfWork uow;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;

    public DeliverShipmentService(
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

    public async Task<ErrorOr<Success>> DeliverAsync(Guid shipmentId, DeliverShipmentRequest request, CancellationToken ct = default)
    {
        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
            return employeeIdResult.Errors;

        var shipment = await shipments.GetByIdAsync(shipmentId, ct);
        if (shipment is null)
            return Error.NotFound(description: "Shipment not found.");

        var result = shipment.Deliver(employeeIdResult.Value, request.ProofOfDeliveryUrl, clock.UtcNow);

        if (result.IsError)
            return result.Errors;

        var driver = await drivers.GetByIdAsync(shipment.DriverId!.Value, ct);
        var truck = await trucks.GetByIdAsync(shipment.TruckId!.Value, ct);

        driver?.Driver?.SetAvailable();
        truck?.MarkAvailable();

        await uow.SaveChangesAsync(ct);

        return Result.Success;
    }
}
