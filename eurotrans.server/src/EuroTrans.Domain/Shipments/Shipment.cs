using EuroTrans.Domain.Activities;
using EuroTrans.Domain.Common;
using EuroTrans.Domain.Drivers;
using EuroTrans.Domain.Enums;
using EuroTrans.Domain.Milestones;
using EuroTrans.Domain.Trucks;

namespace EuroTrans.Domain.Shipments;

public class Shipment
{
    public Guid Id { get; set; }

    public string TrackingId { get; set; } = null!;
    public ShipmentStatus Status { get; set; }

    public string CargoDescription { get; set; } = null!;
    public float CargoWeight { get; set; }
    public float CargoVolume { get; set; }

    // Origin
    public string OriginAddress { get; set; } = null!;
    public string OriginCity { get; set; } = null!;
    public string OriginCountry { get; set; } = null!;
    public string OriginPostalCode { get; set; } = null!;
    public float OriginLat { get; set; }
    public float OriginLng { get; set; }

    // Destination
    public string DestinationAddress { get; set; } = null!;
    public string DestinationCity { get; set; } = null!;
    public string DestinationCountry { get; set; } = null!;
    public string DestinationPostalCode { get; set; } = null!;
    public float DestinationLat { get; set; }
    public float DestinationLng { get; set; }

    public string? CurrentLocationJson { get; set; }

    public Guid? DriverId { get; set; }
    public Guid? TruckId { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? EstimatedDeliveryDate { get; set; }

    public string? ProofOfDeliveryUrl { get; set; }

    // Navigation
    public Driver? Driver { get; set; }
    public Truck? Truck { get; set; }
    public ICollection<Milestone> Milestones { get; set; } = [];
    public ICollection<Activity> Activities { get; set; } = [];


     public void Publish()
    {
        ShipmentRules.MustBeDraft(this);
        Status = ShipmentStatus.Unassigned;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Assign(Guid driverId, Guid truckId)
    {
        ShipmentRules.CanAssign(this);

        DriverId = driverId;
        TruckId = truckId;
        Status = ShipmentStatus.Assigned;
        UpdatedAt = DateTime.UtcNow;
    }

    // ---------- JOURNEY ----------

    public void StartJourney(Guid driverId)
    {
        ShipmentRules.CanStartJourney(this, driverId);
        StartedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateLocation(string locationJson)
    {
        ShipmentRules.CanUpdateLocation(this);
        CurrentLocationJson = locationJson;
        UpdatedAt = DateTime.UtcNow;
    }

    // ---------- DELIVERY ----------

    public void UploadProofOfDelivery(string podUrl)
    {
        if (!string.IsNullOrWhiteSpace(ProofOfDeliveryUrl))
            throw new DomainException("Proof of delivery already uploaded.");

        ProofOfDeliveryUrl = podUrl;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deliver()
    {
        ShipmentRules.CanDeliver(this);
        Status = ShipmentStatus.Delivered;
        DeliveredAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    // ---------- DELETE ----------

    public void EnsureCanDelete()
    {
        ShipmentRules.CanDelete(this);
    }
}
