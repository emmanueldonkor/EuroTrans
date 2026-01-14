using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.GetShipments;

public record GetShipmentResponse(
    Guid Id,
    string TrackingId,
    ShipmentStatus Status,
    string CargoDescription,
    DateTime CreatedAtUtc,
    DateTime? EstimatedDeliveryDateUtc,
    Guid? DriverId,
    Guid? TruckId
);
