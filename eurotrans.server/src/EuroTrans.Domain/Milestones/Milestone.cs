using EuroTrans.Domain.Enums;
using EuroTrans.Domain.Shipments;

namespace EuroTrans.Domain.Milestones;

public class Milestone
{
    public Guid Id { get; set; }

    public Guid ShipmentId { get; set; }

    public DateTime Timestamp { get; set; }
    public MilestoneType Type { get; set; }
    public string? Note { get; set; }

    public string LocationAddress { get; set; } = null!;
    public string LocationCity { get; set; } = null!;
    public string LocationCountry { get; set; } = null!;
    public string LocationPostalCode { get; set; } = null!;
    public float LocationLat { get; set; }
    public float LocationLng { get; set; }

    // Navigation
    public Shipment Shipment { get; set; } = null!;


     public static Milestone Create(
        Shipment shipment,
        MilestoneType type,
        string note,
        string address,
        string city,
        string country,
        string postalCode,
        float lat,
        float lng)
    {
        MilestoneRules.CanCreate(shipment, note);

        return new Milestone
        {
            Id = Guid.NewGuid(),
            ShipmentId = shipment.Id,
            Type = type,
            Note = note,
            Timestamp = DateTime.UtcNow,
            LocationAddress = address,
            LocationCity = city,
            LocationCountry = country,
            LocationPostalCode = postalCode,
            LocationLat = lat,
            LocationLng = lng
        };
    }
}
