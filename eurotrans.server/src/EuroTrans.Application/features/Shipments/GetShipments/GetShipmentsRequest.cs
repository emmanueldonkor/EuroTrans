using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.GetShipments;

public record GetShipmentsRequest(
    ShipmentStatus? Status,
    Guid? DriverId,
    DateTime? StartDate,
    DateTime? EndDate,
    string? Search,
    bool? HasProofOfDelivery,
    int Page = 1,
    int PageSize = 20
);
