using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.GetShipments;

public record GetShipmentsItemResponse(
    Guid Id,
    string TrackingId,
    ShipmentStatus Status,
    string CargoDescription,
    DateTime CreatedAtUtc,
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
