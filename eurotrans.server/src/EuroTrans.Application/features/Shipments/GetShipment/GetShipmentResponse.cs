using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.GetShipment;

public record GetShipmentResponse(
    Guid Id,
    string TrackingId,
    ShipmentStatus Status,
    CargoDto Cargo,
    AddressDto Origin,
    AddressDto Destination,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    DateTime? StartedAtUtc,
    DateTime? DeliveredAtUtc,
    DateTime? EstimatedDeliveryDateUtc,
    string? ProofOfDeliveryUrl,
    Guid? DriverId,
    Guid? TruckId,
    DriverDto? Driver,
    TruckDto? Truck,
    List<ActivityDto> Activities,
    List<MilestoneDto> Milestones
);

public record CargoDto(
    string Description,
    float Weight,
    float Volume
);

public record AddressDto(
    string AddressLine,
    string City,
    string Country,
    string PostalCode
);

public record DriverDto(
    Guid Id,
    string Name,
    string? Phone
);

public record TruckDto(
    Guid Id,
    string PlateNumber,
    string Model
);

public record ActivityDto(
    Guid Id,
    string Description,
    ActivityType Type,
    DateTime TimestampUtc,
    Guid EmployeeId,
    string EmployeeName
);

public record MilestoneDto(
    Guid Id,
    MilestoneType Type,
    double Latitude,
    double Longitude,
    string Note,
    string? LocationLabel,
    DateTime TimestampUtc,
    string EmployeeName
);
