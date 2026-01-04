using EuroTrans.Domain.Common;
using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Domain.Shipments;

public class Milestone : Entity
{
    public Guid ShipmentId { get; private set; }
    public Guid CreatedByEmployeeId { get; private set; }
    public MilestoneType Type { get; private set; }
    public string Note { get; private set; } = string.Empty;
    public float LocationLat { get; private set; }
    public float LocationLng { get; private set; }
    public DateTime TimestampUtc { get; private set; }

    private Milestone() { }

    public Milestone(
        Guid id,
        Guid shipmentId,
        Guid createdByEmployeeId,
        MilestoneType type,
        string note,
        ValueObjects.GeoLocation location,
        DateTime timestampUtc)
        : base(id)
    {
        ShipmentId = shipmentId;
        CreatedByEmployeeId = createdByEmployeeId;
        Type = type;
        Note = note;
        LocationLat = location.Latitude;
        LocationLng = location.Longitude;
        TimestampUtc = timestampUtc;
    }
}

