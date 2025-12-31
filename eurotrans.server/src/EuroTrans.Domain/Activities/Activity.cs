using EuroTrans.Domain.Employees;
using EuroTrans.Domain.Enums;
using EuroTrans.Domain.Shipments;

namespace EuroTrans.Domain.Activities;

public class Activity
{
    public Guid Id { get; set; }
    public Guid ShipmentId { get; set; }
    public Guid UserId { get; set; }
    public ActivityType Type { get; set; }
    public string Description { get; set; } = null!;
    public DateTime Timestamp { get; set; }

    // Navigation
    public Shipment Shipment { get; set; } = null!;
    public Employee User { get; set; } = null!;

    public static Activity Create(
        Guid shipmentId,
        Guid userId,
        ActivityType type,
        string description)
    {
        ActivityRules.Validate(description);

        return new Activity
        {
            Id = Guid.NewGuid(),
            ShipmentId = shipmentId,
            UserId = userId,
            Type = type,
            Description = description,
            Timestamp = DateTime.UtcNow
        };
    }
}
