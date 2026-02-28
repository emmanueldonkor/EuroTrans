using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Shipments.StartShipment;

public class StartShipmentService
{
    private readonly ILogger<StartShipmentService> logger;
    private readonly IShipmentRepository shipments;
    private readonly IUnitOfWork uow;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;
    private readonly IQueryCache cache;

    public StartShipmentService(
        ILogger<StartShipmentService> logger,
        IShipmentRepository shipments,
        IUnitOfWork uow,
        ICurrentEmployeeProvider currentEmployeeProvider,
        IDateTimeProvider clock,
        IQueryCache cache)
    {
        this.logger = logger;
        this.shipments = shipments;
        this.uow = uow;
        this.currentEmployeeProvider = currentEmployeeProvider;
        this.clock = clock;
        this.cache = cache;
    }

    public async Task<ErrorOr<Success>> StartAsync(Guid shipmentId, CancellationToken ct = default)
    {
        logger.LogInformation("Start shipment requested. ShipmentId: {ShipmentId}", shipmentId);

        if (shipmentId == Guid.Empty)
        {
            logger.LogWarning("Start shipment rejected because shipment id is empty.");
            return Error.Validation("ShipmentId.Invalid", "Shipment ID cannot be empty.");
        }

        // Get current driver ID
        var driverIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (driverIdResult.IsError)
        {
            logger.LogWarning("Start shipment denied due to missing current driver context. ShipmentId: {ShipmentId}", shipmentId);
            return driverIdResult.Errors;
        }

        // Fetch shipment
        var shipment = await shipments.GetByIdAsync(shipmentId, ct);
        if (shipment is null)
        {
            logger.LogWarning("Start shipment failed. Shipment not found. ShipmentId: {ShipmentId}", shipmentId);
            return Error.NotFound("Shipment not found.");
        }

        // Domain rule: only assigned driver can start
        var result = shipment.Start(driverIdResult.Value, clock.UtcNow);
        if (result.IsError)
        {
            logger.LogWarning(
                "Start shipment rejected by domain rules. ShipmentId: {ShipmentId}, DriverId: {DriverId}",
                shipmentId,
                driverIdResult.Value);
            return result.Errors;
        }

        // Save changes with concurrency check
        var saveResult = await uow.SaveChangesWithConcurrencyCheckAsync(ct);
        if (saveResult.IsError)
        {
            logger.LogWarning(
                "Start shipment failed during persistence. ShipmentId: {ShipmentId}, DriverId: {DriverId}",
                shipmentId,
                driverIdResult.Value);
            return saveResult.Errors;
        }

        cache.BumpVersion(QueryCacheScopes.Shipments);

        logger.LogInformation(
            "Shipment started successfully. ShipmentId: {ShipmentId}, DriverId: {DriverId}",
            shipmentId,
            driverIdResult.Value);

        return Result.Success;
    }
}
