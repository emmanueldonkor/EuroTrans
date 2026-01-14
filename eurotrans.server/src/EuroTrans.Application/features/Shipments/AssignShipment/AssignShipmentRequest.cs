namespace EuroTrans.Application.features.Shipments.AssignShipment;

public record AssignShipmentRequest(Guid DriverId, Guid TruckId);
