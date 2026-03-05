using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.GetCurrentDriverShipment;

public record GetCurrentDriverShipmentResponse(
    Guid Id,
    string TrackingId,
    ShipmentStatus Status,
    string CargoDescription,
    float CargoWeight,
    float CargoVolume,
    string OriginAddress,
    string OriginCity,
    string OriginCountry,
    string OriginPostalCode,
    string DestinationAddress,
    string DestinationCity,
    string DestinationCountry,
    string DestinationPostalCode
);
