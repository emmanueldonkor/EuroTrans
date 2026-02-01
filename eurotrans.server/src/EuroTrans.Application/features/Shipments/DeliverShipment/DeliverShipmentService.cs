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
    private readonly ICurrentUser currentUser;
    private readonly IDateTimeProvider clock;

    public DeliverShipmentService(
        IShipmentRepository shipments,
        IEmployeeRepository drivers,
        ITruckRepository trucks,
        IUnitOfWork uow,
        ICurrentUser currentUser,
        IDateTimeProvider clock)
    {
        this.shipments = shipments;
        this.drivers = drivers;
        this.trucks = trucks;
        this.uow = uow;
        this.currentUser = currentUser;
        this.clock = clock;
    }

    public async Task<ErrorOr<Success>> DeliverAsync(Guid shipmentId, DeliverShipmentRequest request)
    {

        if (!currentUser.IsDriver)
            return Error.Forbidden(description: "Only drivers can deliver shipments.");


        var shipment = await shipments.GetByIdAsync(shipmentId);
        if (shipment is null)
            return Error.NotFound(description: "Shipment not found.");

        var result = shipment.Deliver(currentUser.Id, request.ProofOfDeliveryUrl, clock.UtcNow);

        if (result.IsError)
            return result.Errors;

        var driver = await drivers.GetByIdAsync(shipment.DriverId!.Value);
        var truck = await trucks.GetByIdAsync(shipment.TruckId!.Value);

        driver?.Driver?.SetAvailable();
        truck?.MarkAvailable();

        await uow.SaveChangesAsync();

        return Result.Success;
    }
}
