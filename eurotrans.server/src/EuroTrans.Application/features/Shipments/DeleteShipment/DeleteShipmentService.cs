using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Trucks;

namespace EuroTrans.Application.features.Shipments.DeleteShipment;

public class DeleteShipmentService
{
    private readonly ILogger<DeleteShipmentService> logger;
    private readonly IShipmentRepository shipments;
    private readonly IEmployeeRepository drivers;
    private readonly ITruckRepository trucks;
    private readonly IUnitOfWork uow;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;
    private readonly IQueryCache cache;

    public DeleteShipmentService(
        ILogger<DeleteShipmentService> logger,
        IShipmentRepository shipments,
        IEmployeeRepository drivers,
        ITruckRepository trucks,
        IUnitOfWork uow,
        ICurrentEmployeeProvider currentEmployeeProvider,
        IDateTimeProvider clock,
        IQueryCache cache)
    {
        this.logger = logger;
        this.shipments = shipments;
        this.drivers = drivers;
        this.trucks = trucks;
        this.uow = uow;
        this.currentEmployeeProvider = currentEmployeeProvider;
        this.clock = clock;
        this.cache = cache;
    }

    public async Task<ErrorOr<Success>> DeleteAsync(Guid shipmentId, CancellationToken ct = default)
    {
        logger.LogInformation("Cancel shipment requested. ShipmentId: {ShipmentId}", shipmentId);

        if (shipmentId == Guid.Empty)
        {
            logger.LogWarning("Cancel shipment rejected because shipment id is empty.");
            return Error.Validation("ShipmentId.Invalid", "Shipment ID cannot be empty.");
        }

        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
        {
            logger.LogWarning("Cancel shipment denied due to missing current employee context. ShipmentId: {ShipmentId}", shipmentId);
            return employeeIdResult.Errors;
        }

        var shipment = await shipments.GetByIdAsync(shipmentId, ct);
        if (shipment is null)
        {
            logger.LogWarning("Cancel shipment failed. Shipment not found. ShipmentId: {ShipmentId}", shipmentId);
            return Error.NotFound("Shipment not found.");
        }

        // Domain handles rules & activities
        var deleteResult = shipment.Delete(employeeIdResult.Value, clock.UtcNow);
        if (deleteResult.IsError)
        {
            logger.LogWarning(
                "Cancel shipment rejected by domain rules. ShipmentId: {ShipmentId}, EmployeeId: {EmployeeId}",
                shipmentId,
                employeeIdResult.Value);
            return deleteResult.Errors;
        }

        // Release driver if assigned
        if (shipment.DriverId.HasValue)
        {
            var driver = await drivers.GetByIdAsync(shipment.DriverId.Value, ct);
            if (driver?.Driver is null)
            {
                logger.LogWarning("Cancel shipment failed. Assigned driver not found. ShipmentId: {ShipmentId}", shipmentId);
                return Error.NotFound("Assigned driver not found.");
            }

            driver.Driver.SetAvailable();
        }

        // Release truck if assigned
        if (shipment.TruckId.HasValue)
        {
            var truck = await trucks.GetByIdAsync(shipment.TruckId.Value, ct);
            if (truck is null)
            {
                logger.LogWarning("Cancel shipment failed. Assigned truck not found. ShipmentId: {ShipmentId}", shipmentId);
                return Error.NotFound("Assigned truck not found.");
            }

            truck.MarkAvailable();
        }

        // Save changes with concurrency check
        var saveResult = await uow.SaveChangesWithConcurrencyCheckAsync(ct);
        if (saveResult.IsError)
        {
            logger.LogWarning(
                "Cancel shipment failed during persistence. ShipmentId: {ShipmentId}",
                shipmentId);
            return saveResult.Errors;
        }

        cache.BumpVersion(QueryCacheScopes.Shipments);
        cache.BumpVersion(QueryCacheScopes.Drivers);
        cache.BumpVersion(QueryCacheScopes.Trucks);

        logger.LogInformation("Shipment cancelled successfully. ShipmentId: {ShipmentId}", shipmentId);

        return Result.Success;
    }
}
