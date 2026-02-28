using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Trucks;
using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.DeliverShipment;

public class DeliverShipmentService
{
    private readonly ILogger<DeliverShipmentService> logger;
    private readonly IShipmentRepository shipments;
    private readonly IEmployeeRepository drivers;
    private readonly ITruckRepository trucks;
    private readonly IUnitOfWork uow;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;
    private readonly IPodService podService;
    private readonly IQueryCache cache;

    public DeliverShipmentService(
        ILogger<DeliverShipmentService> logger,
        IShipmentRepository shipments,
        IEmployeeRepository drivers,
        ITruckRepository trucks,
        IUnitOfWork uow,
        ICurrentEmployeeProvider currentEmployeeProvider,
        IDateTimeProvider clock,
        IPodService podService,
        IQueryCache cache)
    {
        this.logger = logger;
        this.shipments = shipments;
        this.drivers = drivers;
        this.trucks = trucks;
        this.uow = uow;
        this.currentEmployeeProvider = currentEmployeeProvider;
        this.clock = clock;
        this.podService = podService;
        this.cache = cache;
    }

    public async Task<ErrorOr<Success>> DeliverAsync(
        Guid shipmentId,
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken ct = default)
    {
        logger.LogInformation(
            "Deliver shipment requested. ShipmentId: {ShipmentId}, FileName: {FileName}, ContentType: {ContentType}",
            shipmentId,
            fileName,
            contentType);

        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
        {
            logger.LogWarning("Deliver shipment denied due to missing current driver context. ShipmentId: {ShipmentId}", shipmentId);
            return employeeIdResult.Errors;
        }

        var shipment = await shipments.GetByIdAsync(shipmentId, ct);
        if (shipment is null)
        {
            logger.LogWarning("Deliver shipment failed. Shipment not found. ShipmentId: {ShipmentId}", shipmentId);
            return Error.NotFound("Shipment not found.");
        }

        if (shipment.Status != ShipmentStatus.InTransit)
        {
            logger.LogWarning(
                "Deliver shipment rejected due to invalid status. ShipmentId: {ShipmentId}, Status: {Status}",
                shipmentId,
                shipment.Status);
            return Error.Validation("Shipment.InvalidStatus", "Shipment must be in-transit to deliver.");
        }

        if (shipment.DriverId != employeeIdResult.Value)
        {
            logger.LogWarning(
                "Deliver shipment forbidden. ShipmentId: {ShipmentId}, ExpectedDriverId: {ExpectedDriverId}, RequestedByDriverId: {DriverId}",
                shipmentId,
                shipment.DriverId,
                employeeIdResult.Value);
            return Error.Forbidden("Shipment.Unauthorized", "Only assigned driver can deliver.");
        }

        string? proofUrl = null;
        try
        {
            proofUrl = await podService.UploadAsync(fileStream, fileName, contentType);

            var result = shipment.Deliver(employeeIdResult.Value, proofUrl, clock.UtcNow);
            if (result.IsError)
            {
                logger.LogWarning(
                    "Deliver shipment rejected by domain rules. ShipmentId: {ShipmentId}, DriverId: {DriverId}",
                    shipmentId,
                    employeeIdResult.Value);
                await CleanupProofAsync(proofUrl, ct);
                return result.Errors;
            }

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

            var saveResult = await uow.SaveChangesWithConcurrencyCheckAsync(ct);
            if (saveResult.IsError)
            {
                logger.LogWarning(
                    "Deliver shipment failed during persistence. ShipmentId: {ShipmentId}, DriverId: {DriverId}",
                    shipmentId,
                    employeeIdResult.Value);
                await CleanupProofAsync(proofUrl, ct);
                return saveResult.Errors;
            }

            cache.BumpVersion(QueryCacheScopes.Shipments);
            cache.BumpVersion(QueryCacheScopes.Drivers);
            cache.BumpVersion(QueryCacheScopes.Trucks);

            logger.LogInformation(
                "Shipment delivered successfully. ShipmentId: {ShipmentId}, DriverId: {DriverId}",
                shipmentId,
                employeeIdResult.Value);

            return Result.Success;
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Deliver shipment failed unexpectedly. ShipmentId: {ShipmentId}, DriverId: {DriverId}",
                shipmentId,
                employeeIdResult.Value);
            await CleanupProofAsync(proofUrl, ct);
            throw;
        }
    }

    private async Task CleanupProofAsync(string? proofUrl, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(proofUrl))
            return;

        try
        {
            await podService.DeleteAsync(proofUrl, ct);
        }
        catch
        {
            // Best effort cleanup to avoid orphan files on failed delivery.
        }
    }
}
