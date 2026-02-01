using ErrorOr;
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

    public async Task<ErrorOr<Success>> StartAsync(Guid shipmentId)
    {
        if (!currentUser.IsDriver)
            return Error.Forbidden(description: "Only drivers can start shipments.");

        var shipment = await shipments.GetByIdAsync(shipmentId);
        if (shipment is null)
            return Error.NotFound(description: "Shipment not found.");

        var result = shipment.Start(currentUser.Id, clock.UtcNow);

        if (result.IsError)
            return result.Errors;

        await uow.SaveChangesAsync();

        return Result.Success;
    }
}
