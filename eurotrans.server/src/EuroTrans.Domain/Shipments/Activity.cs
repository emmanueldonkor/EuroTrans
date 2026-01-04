using EuroTrans.Domain.Common;
using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Domain.Shipments;

public class Activity : Entity
{
    public Guid ShipmentId { get; private set; }
    public Guid EmployeeId { get; private set; }
    public ActivityType Type { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public DateTime TimestampUtc { get; private set; }

    private Activity() { }

    public Activity(
        Guid id,
        Guid shipmentId,
        Guid employeeId,
        ActivityType type,
        string description,
        DateTime timestampUtc) : base(id)
    {
        ShipmentId = shipmentId;
        EmployeeId = employeeId;
        Type = type;
        Description = description;
        TimestampUtc = timestampUtc;
    }
}