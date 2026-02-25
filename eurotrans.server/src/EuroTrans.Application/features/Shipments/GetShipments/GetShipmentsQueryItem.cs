using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.GetShipments;

public record GetShipmentsQueryItem(
    Guid Id,
    string TrackingId,
    ShipmentStatus Status,
    string? DriverName,
    string? OriginCity,
    string? OriginCountry,
    string? DestinationCity,
    string? DestinationCountry,
    DateTime? UpdatedAtUtc
);
