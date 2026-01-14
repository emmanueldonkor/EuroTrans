using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Shipments.StartShipment;

public class StartShipmentService
{
    private readonly IShipmentRepository shipments;
    private readonly IUnitOfWork uow;
    private readonly ICurrentUser currentUser;
    private readonly IDateTimeProvider clock;

    public StartShipmentService(
        IShipmentRepository shipments,
        IUnitOfWork uow,
        ICurrentUser currentUser,
        IDateTimeProvider clock)
    {
        this.shipments = shipments;
        this.uow = uow;
        this.currentUser = currentUser;
        this.clock = clock;
    }

    public async Task StartAsync(Guid shipmentId)
    {
        if (!currentUser.IsDriver)
            throw new DomainException("Only drivers can start shipments.");

        var shipment = await shipments.GetByIdAsync(shipmentId)
            ?? throw new DomainException("Shipment not found.");

        // DOMAIN LOGIC
        shipment.Start(currentUser.Id, clock.UtcNow);

        await uow.SaveChangesAsync();
    }
}
