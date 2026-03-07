using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.GetShipments;

public record GetShipmentsQueryItem(
    Guid Id,
    string TrackingId,
    string CargoDescription,
    ShipmentStatus Status,
    string? DriverName,
    string? OriginCity,
    string? OriginCountry,
    string? DestinationCity,
    string? DestinationCountry,
    DateTime? UpdatedAtUtc,
    DateTime? DeliveredAtUtc,
    string? ProofOfDeliveryUrl
);
