using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.Tracking;

public record GetLivePinsResponse(
    Guid ShipmentId,
    string TrackingId,
    string DriverName,
    string Cargo,
    ShipmentStatus Status,
    double Latitude,
    double Longitude,
    DateTime LastUpdateUtc,
    bool IsStale
);
