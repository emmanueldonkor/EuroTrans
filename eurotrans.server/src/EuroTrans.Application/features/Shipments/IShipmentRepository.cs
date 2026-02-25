using EuroTrans.Application.features.Shipments.GetShipments;
using EuroTrans.Domain.Shipments;
using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments;

public interface IShipmentRepository
{
    Task<Shipment?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Shipment shipment, CancellationToken ct = default);
    Task<bool> HasActiveAssignmentForDriverAsync(Guid driverId, CancellationToken ct = default);
    Task<bool> HasActiveAssignmentForTruckAsync(Guid truckId, CancellationToken ct = default);
    Task<(List<GetShipmentsQueryItem> Items, int TotalCount)> GetFilteredAsync(
     ShipmentStatus? status,
     Guid? driverId,
     DateTime? startDate,
     DateTime? endDate,
     string? search,
     int page,
     int pageSize,
     CancellationToken ct = default);
}
