using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.Tracking;

public record ShipmentLivePinQueryItem(
    Guid ShipmentId,
    string TrackingId,
    string? DriverName,
    string CargoDescription,
    ShipmentStatus Status,
    double? Latitude,
    double? Longitude,
    DateTime? LastLocationUpdatedAtUtc
);
