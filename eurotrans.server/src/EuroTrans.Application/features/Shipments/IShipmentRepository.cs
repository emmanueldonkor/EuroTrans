using EuroTrans.Domain.Shipments;
using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments;

public interface IShipmentRepository
{
    Task<Shipment?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Shipment shipment, CancellationToken ct = default);
    Task<List<Shipment>> GetFilteredAsync(
        ShipmentStatus? status,
        Guid? driverId,
        DateTime? startDate,
        DateTime? endDate,
        string? search, 
        CancellationToken ct = default);  
}