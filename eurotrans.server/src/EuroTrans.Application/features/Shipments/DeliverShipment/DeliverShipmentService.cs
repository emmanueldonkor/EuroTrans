using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Trucks;
using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.DeliverShipment;

public class DeliverShipmentService
{
    private readonly IShipmentRepository shipments;
    private readonly IEmployeeRepository drivers;
    private readonly ITruckRepository trucks;
    private readonly IUnitOfWork uow;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;
    private readonly IPodService podService;
    private readonly IQueryCache cache;

    public DeliverShipmentService(
        IShipmentRepository shipments,
        IEmployeeRepository drivers,
        ITruckRepository trucks,
        IUnitOfWork uow,
        ICurrentEmployeeProvider currentEmployeeProvider,
        IDateTimeProvider clock,
        IPodService podService,
        IQueryCache cache)
    {
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
        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
            return employeeIdResult.Errors;

        var shipment = await shipments.GetByIdAsync(shipmentId, ct);
        if (shipment is null)
            return Error.NotFound("Shipment not found.");

        if (shipment.Status != ShipmentStatus.InTransit)
            return Error.Validation("Shipment.InvalidStatus", "Shipment must be in-transit to deliver.");

        if (shipment.DriverId != employeeIdResult.Value)
            return Error.Forbidden("Shipment.Unauthorized", "Only assigned driver can deliver.");

        string? proofUrl = null;
        try
        {
            proofUrl = await podService.UploadAsync(fileStream, fileName, contentType);

            var result = shipment.Deliver(employeeIdResult.Value, proofUrl, clock.UtcNow);
            if (result.IsError)
            {
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
                await CleanupProofAsync(proofUrl, ct);
                return saveResult.Errors;
            }

            cache.BumpVersion(QueryCacheScopes.Shipments);
            cache.BumpVersion(QueryCacheScopes.Drivers);
            cache.BumpVersion(QueryCacheScopes.Trucks);

            return Result.Success;
        }
        catch
        {
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
