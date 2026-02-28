using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Trucks;
using EuroTrans.Domain.Employees.Enums;
using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Shipments.AssignShipment;

public class AssignShipmentService
{
    private readonly ILogger<AssignShipmentService> logger;
    private readonly IShipmentRepository shipments;
    private readonly IEmployeeRepository drivers;
    private readonly ITruckRepository trucks;
    private readonly IUnitOfWork uow;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;
    private readonly IQueryCache cache;

    public AssignShipmentService(
        ILogger<AssignShipmentService> logger,
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

    public async Task<ErrorOr<Success>> AssignAsync(Guid shipmentId, AssignShipmentRequest request, CancellationToken ct = default)
    {
        logger.LogInformation(
            "Assign shipment requested. ShipmentId: {ShipmentId}, DriverId: {DriverId}, TruckId: {TruckId}",
            shipmentId,
            request.DriverId,
            request.TruckId);

        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
        {
            logger.LogWarning(
                "Assign shipment denied due to missing current employee context. ShipmentId: {ShipmentId}",
                shipmentId);
            return employeeIdResult.Errors;
        }

        // Load shipment
        var shipment = await shipments.GetByIdAsync(shipmentId, ct);
        if (shipment is null)
        {
            logger.LogWarning("Assign shipment failed. Shipment not found. ShipmentId: {ShipmentId}", shipmentId);
            return Error.NotFound("Shipment not found.");
        }

        // Load driver
        var driver = await drivers.GetByIdAsync(request.DriverId, ct);
        if (driver is null)
        {
            logger.LogWarning("Assign shipment failed. Driver not found. ShipmentId: {ShipmentId}, DriverId: {DriverId}", shipmentId, request.DriverId);
            return Error.NotFound("Driver not found.");
        }

        if (driver.Driver is null)
        {
            logger.LogWarning("Assign shipment failed. Driver profile missing. ShipmentId: {ShipmentId}, DriverId: {DriverId}", shipmentId, request.DriverId);
            return Error.Validation("Selected employee does not have a driver profile.");
        }

        if (driver.Driver.Status != DriverStatus.Available)
        {
            logger.LogWarning(
                "Assign shipment failed. Driver unavailable. ShipmentId: {ShipmentId}, DriverId: {DriverId}, DriverStatus: {DriverStatus}",
                shipmentId,
                request.DriverId,
                driver.Driver.Status);
            return Error.Conflict("Driver is not available.");
        }

        // Load truck
        var truck = await trucks.GetByIdAsync(request.TruckId, ct);
        if (truck is null)
        {
            logger.LogWarning("Assign shipment failed. Truck not found. ShipmentId: {ShipmentId}, TruckId: {TruckId}", shipmentId, request.TruckId);
            return Error.NotFound("Truck not found.");
        }

        if (truck.Status != TruckStatus.Available)
        {
            logger.LogWarning(
                "Assign shipment failed. Truck unavailable. ShipmentId: {ShipmentId}, TruckId: {TruckId}, TruckStatus: {TruckStatus}",
                shipmentId,
                request.TruckId,
                truck.Status);
            return Error.Conflict("Truck is not available.");
        }

        // Assign shipment (domain rules)
        var result = shipment.Assign(employeeIdResult.Value, driver.Id, truck.Id, clock.UtcNow);
        if (result.IsError)
        {
            logger.LogWarning(
                "Assign shipment rejected by domain rules. ShipmentId: {ShipmentId}, DriverId: {DriverId}, TruckId: {TruckId}",
                shipmentId,
                request.DriverId,
                request.TruckId);
            return result.Errors;
        }

        // Update driver/truck state
        driver.Driver.SetOnDuty();
        truck.MarkInUse();

        // Save changes via UnitOfWork (repository handles concurrency)
        var saveResult = await uow.SaveChangesWithConcurrencyCheckAsync(ct);
        if (saveResult.IsError)
        {
            logger.LogWarning(
                "Assign shipment failed during persistence. ShipmentId: {ShipmentId}, DriverId: {DriverId}, TruckId: {TruckId}",
                shipmentId,
                request.DriverId,
                request.TruckId);
            return saveResult.Errors;
        }

        cache.BumpVersion(QueryCacheScopes.Shipments);
        cache.BumpVersion(QueryCacheScopes.Drivers);
        cache.BumpVersion(QueryCacheScopes.Trucks);

        logger.LogInformation(
            "Shipment assigned successfully. ShipmentId: {ShipmentId}, DriverId: {DriverId}, TruckId: {TruckId}",
            shipmentId,
            request.DriverId,
            request.TruckId);

        return Result.Success;
    }
}
