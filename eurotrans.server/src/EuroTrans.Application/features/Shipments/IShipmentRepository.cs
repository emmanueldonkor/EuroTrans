using EuroTrans.Application.features.Shipments.GetShipments;
using EuroTrans.Application.features.Shipments.Tracking;
using EuroTrans.Domain.Shipments;
using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments;

public interface IShipmentRepository
{
    Task<Shipment?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Shipment?> GetForTrackingAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Shipment shipment, CancellationToken ct = default);
    Task<bool> HasActiveAssignmentForDriverAsync(Guid driverId, CancellationToken ct = default);
    Task<bool> HasActiveAssignmentForTruckAsync(Guid truckId, CancellationToken ct = default);
    Task<(List<ShipmentLivePinQueryItem> Items, int TotalCount)> GetLivePinItemsPagedAsync(
        int page,
        int pageSize,
        CancellationToken ct = default);
    Task<(List<GetShipmentsQueryItem> Items, int TotalCount)> GetFilteredAsync(
     ShipmentStatus? status,
     Guid? driverId,
     DateTime? startDate,
     DateTime? endDate,
     string? search,
     bool? hasProofOfDelivery,
     int page,
     int pageSize,
     CancellationToken ct = default);
}
