using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.GetShipment;

public record GetShipmentResponse(
    Guid Id,
    string TrackingId,
    ShipmentStatus Status,
    string CargoDescription,
    float CargoWeight,
    float CargoVolume,
    AddressDto Origin,
    AddressDto Destination,
    DateTime CreatedAtUtc,
    DateTime? EstimatedDeliveryDateUtc,
    Guid? DriverId,
    Guid? TruckId,
    List<MilestoneDto> Milestones,
    List<ActivityDto> Activities
);

public record AddressDto(string AddressLine, string City, string Country, string PostalCode);

public record MilestoneDto(
    Guid Id,
    double Latitude,
    double Longitude,
    string Note,
    DateTime TimestampUtc
);

public record ActivityDto(
    Guid Id,
    string Description,
    ActivityType Type,
    DateTime TimestampUtc
);
