using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.GetShipments;

public record AddressSummaryDto(
    string City,
    string Country
);

public record GetShipmentsItemResponse(
    Guid Id,
    string TrackingId,
    ShipmentStatus Status,
    string CargoDescription,
    AddressSummaryDto Origin,
    AddressSummaryDto Destination,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    DateTime? EstimatedDeliveryDateUtc,
    Guid? DriverId,
    Guid? TruckId
);

public record GetShipmentsResponse(
    IReadOnlyList<GetShipmentsItemResponse> Items,
    int TotalCount,
    int Page,
    int PageSize
);
