using EuroTrans.Domain.Common;
using EuroTrans.Domain.Employees;
using EuroTrans.Domain.Shipments.Enums;
using EuroTrans.Domain.Shipments;

public class Milestone : Entity
{
    public Guid ShipmentId { get; private set; }
    public Guid EmployeeId { get; private set; }
    public MilestoneType Type { get; private set; }
    public string Note { get; private set; } = string.Empty;
    public string? LocationLabel { get; private set; }
    public double LocationLat { get; private set; }
    public double LocationLng { get; private set; }
    public DateTime TimestampUtc { get; private set; }
    public Shipment? Shipment { get; private set; }
    public Employee? Employee { get; private set; }
    private Milestone() { }

    public Milestone(
        Guid id,
        Guid shipmentId,
        Guid createdByEmployeeId,
        MilestoneType type,
        string note,
        string? locationLabel,
        double latitude,
        double longitude,
        DateTime timestampUtc)
        : base(id)
    {
        ShipmentId = shipmentId;
        EmployeeId = createdByEmployeeId;
        Type = type;
        Note = note;
        LocationLabel = locationLabel;
        LocationLat = latitude;
        LocationLng = longitude;
        TimestampUtc = timestampUtc;
    }
}
