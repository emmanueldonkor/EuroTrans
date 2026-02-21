using ErrorOr;
using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Shipments.StartShipment;

public class StartShipmentService
{
    private readonly IShipmentRepository shipments;
    private readonly IUnitOfWork uow;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;

    public StartShipmentService(
        IShipmentRepository shipments,
        IUnitOfWork uow,
        ICurrentEmployeeProvider currentEmployeeProvider,
        IDateTimeProvider clock)
    {
        this.shipments = shipments;
        this.uow = uow;
        this.currentEmployeeProvider = currentEmployeeProvider;
        this.clock = clock;
    }

    public async Task<ErrorOr<Success>> StartAsync(Guid shipmentId, CancellationToken ct = default)
    {
        if (shipmentId == Guid.Empty)
            return Error.Validation("ShipmentId.Invalid", "Shipment ID cannot be empty.");

        // Get current driver ID
        var driverIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (driverIdResult.IsError)
            return driverIdResult.Errors;

        // Fetch shipment
        var shipment = await shipments.GetByIdAsync(shipmentId, ct);
        if (shipment is null)
            return Error.NotFound("Shipment not found.");

        // Domain rule: only assigned driver can start
        var result = shipment.Start(driverIdResult.Value, clock.UtcNow);
        if (result.IsError)
            return result.Errors;

        // Save changes with concurrency check
        var saveResult = await uow.SaveChangesWithConcurrencyCheckAsync(ct);
        if (saveResult.IsError)
            return saveResult.Errors;

        return Result.Success;
    }
}
