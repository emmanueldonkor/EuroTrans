namespace EuroTrans.Domain.Shipments.Enums;

public enum ShipmentStatus
{
    Draft = 1,
    Unassigned = 2,
    Assigned = 3,
    InTransit = 4,
    Delivered = 5,
    Cancelled = 6
}