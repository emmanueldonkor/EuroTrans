using EuroTrans.Domain.Shipments;
using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments;

public interface IShipmentRepository
{
    Task<Shipment?> GetByIdAsync(Guid id);
    Task AddAsync(Shipment shipment);
    Task<List<Shipment>> GetFilteredAsync(
        ShipmentStatus? status,
        Guid? driverId,
        DateTime? startDate,
        DateTime? endDate,
        string? search);  
}