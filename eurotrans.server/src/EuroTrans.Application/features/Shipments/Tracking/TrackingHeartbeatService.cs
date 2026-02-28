using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.Tracking;

public class TrackingHeartbeatService
{
    private readonly ILogger<TrackingHeartbeatService> logger;
    private readonly IShipmentRepository shipments;
    private readonly IUnitOfWork uow;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;

    public TrackingHeartbeatService(
        ILogger<TrackingHeartbeatService> logger,
        IShipmentRepository shipments,
        IUnitOfWork uow,
        ICurrentEmployeeProvider currentEmployeeProvider,
        IDateTimeProvider clock)
    {
        this.logger = logger;
        this.shipments = shipments;
        this.uow = uow;
        this.currentEmployeeProvider = currentEmployeeProvider;
        this.clock = clock;
    }

    public async Task<ErrorOr<Success>> AddAsync(
        Guid shipmentId,
        TrackingHeartbeatRequest request,
        CancellationToken ct = default)
    {
        logger.LogDebug(
            "Tracking heartbeat requested. ShipmentId: {ShipmentId}, Latitude: {Latitude}, Longitude: {Longitude}",
            shipmentId,
            request.Latitude,
            request.Longitude);

        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
        {
            logger.LogWarning("Tracking heartbeat denied due to missing current driver context. ShipmentId: {ShipmentId}", shipmentId);
            return employeeIdResult.Errors;
        }

        var shipment = await shipments.GetForTrackingAsync(shipmentId, ct);
        if (shipment is null)
        {
            logger.LogWarning("Tracking heartbeat failed. Shipment not found. ShipmentId: {ShipmentId}", shipmentId);
            return Error.NotFound(description: "Shipment not found.");
        }

        if (shipment.Status != ShipmentStatus.InTransit)
        {
            logger.LogWarning("Tracking heartbeat rejected due to invalid shipment status. ShipmentId: {ShipmentId}, Status: {Status}", shipmentId, shipment.Status);
            return Error.Validation("Shipment.InvalidStatus", "Shipment must be in-transit to update tracking.");
        }

        if (shipment.DriverId != employeeIdResult.Value)
        {
            logger.LogWarning(
                "Tracking heartbeat forbidden. ShipmentId: {ShipmentId}, ExpectedDriverId: {ExpectedDriverId}, RequestedByDriverId: {DriverId}",
                shipmentId,
                shipment.DriverId,
                employeeIdResult.Value);
            return Error.Forbidden("Shipment.Unauthorized", "Only assigned driver can update shipment tracking.");
        }

        var locationLabel = string.IsNullOrWhiteSpace(request.LocationLabel)
            ? null
            : request.LocationLabel.Trim();

        var result = shipment.AddMilestone(
            driverId: employeeIdResult.Value,
            lat: request.Latitude,
            lon: request.Longitude,
            note: "Automatic location heartbeat",
            locationLabel: locationLabel,
            type: MilestoneType.LocationUpdate,
            timestampUtc: clock.UtcNow,
            addActivity: false);

        if (result.IsError)
        {
            logger.LogWarning("Tracking heartbeat rejected by domain rules. ShipmentId: {ShipmentId}", shipmentId);
            return result.Errors;
        }

        await uow.SaveChangesAsync(ct);
        logger.LogDebug("Tracking heartbeat saved. ShipmentId: {ShipmentId}", shipmentId);
        return Result.Success;
    }
}
