using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Shipments.DeliverShipment;

public class DeliverShipmentService
{
    private readonly IShipmentRepository shipments;
    private readonly IDriverRepository drivers;
    private readonly ITruckRepository trucks;
    private readonly IUnitOfWork uow;
    private readonly ICurrentUser currentUser;
    private readonly IDateTimeProvider clock;

    public DeliverShipmentService(
        IShipmentRepository shipments,
        IDriverRepository drivers,
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

    public async Task DeliverAsync(Guid shipmentId, DeliverShipmentRequest request)
    {
        if (!currentUser.IsDriver)
            throw new DomainException("Only drivers can deliver shipments.");

        var shipment = await shipments.GetByIdAsync(shipmentId)
            ?? throw new DomainException("Shipment not found.");

        // DOMAIN LOGIC
        shipment.Deliver(currentUser.Id, request.ProofOfDeliveryUrl, clock.UtcNow);

        // Release driver + truck
        var driver = await drivers.GetByIdAsync(shipment.DriverId!.Value);
        var truck = await trucks.GetByIdAsync(shipment.TruckId!.Value);

        driver.SetAvailable();
        truck.MarkAvailable();

        await uow.SaveChangesAsync();
    }
}
