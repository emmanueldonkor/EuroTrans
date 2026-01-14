using EuroTrans.Domain.Common;

public class Milestone : Entity
{
    public Guid ShipmentId { get; private set; }
    public Guid CreatedByEmployeeId { get; private set; }
    public string Note { get; private set; } = string.Empty;
    public double LocationLat { get; private set; }
    public double LocationLng { get; private set; }
    public DateTime TimestampUtc { get; private set; }

    private Milestone() { }

    public Milestone(
        Guid id,
        Guid shipmentId,
        Guid createdByEmployeeId,
        string note,
        double latitude,
        double longitude,
        DateTime timestampUtc)
        : base(id)
    {
        ShipmentId = shipmentId;
        CreatedByEmployeeId = createdByEmployeeId;
        Note = note;
        LocationLat = latitude;
        LocationLng = longitude;
        TimestampUtc = timestampUtc;
    }
}
