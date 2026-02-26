using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.Tracking;

public class TrackingHeartbeatService
{
    private readonly IShipmentRepository shipments;
    private readonly IUnitOfWork uow;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;

    public TrackingHeartbeatService(
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

    public async Task<ErrorOr<Success>> AddAsync(
        Guid shipmentId,
        TrackingHeartbeatRequest request,
        CancellationToken ct = default)
    {
        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
            return employeeIdResult.Errors;

        var shipment = await shipments.GetForTrackingAsync(shipmentId, ct);
        if (shipment is null)
            return Error.NotFound(description: "Shipment not found.");

        if (shipment.Status != ShipmentStatus.InTransit)
            return Error.Validation("Shipment.InvalidStatus", "Shipment must be in-transit to update tracking.");

        if (shipment.DriverId != employeeIdResult.Value)
            return Error.Forbidden("Shipment.Unauthorized", "Only assigned driver can update shipment tracking.");

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
            timestampUtc: clock.UtcNow);

        if (result.IsError)
            return result.Errors;

        await uow.SaveChangesAsync(ct);
        return Result.Success;
    }
}
