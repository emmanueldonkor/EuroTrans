using ErrorOr;
using EuroTrans.Domain.Common;
using EuroTrans.Domain.Employees;
using EuroTrans.Domain.Shipments.Enums;
using EuroTrans.Domain.Shipments.ValueObjects;
using EuroTrans.Domain.Trucks;

namespace EuroTrans.Domain.Shipments;

public class Shipment : AggregateRoot
{
    public string TrackingId { get; private set; } = string.Empty;
    public ShipmentStatus Status { get; private set; }

    public Cargo? Cargo { get; private set; }
    public Address? OriginAddress { get; private set; }
    public GeoLocation? OriginLocation { get; private set; }
    public Address? DestinationAddress { get; private set; }
    public GeoLocation? DestinationLocation { get; private set; }

    public Guid? DriverId { get; private set; }
    public Guid? TruckId { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? UpdatedAtUtc { get; private set; }
    public DateTime? StartedAtUtc { get; private set; }
    public DateTime? DeliveredAtUtc { get; private set; }
    public DateTime? EstimatedDeliveryDateUtc { get; private set; }

    private readonly List<Activity> activities = [];
    private readonly List<Milestone> milestones = [];
    private readonly List<Document> documents = [];

    public Driver? Driver { get; private set; }
    public Truck? Truck { get; private set; }

    public IReadOnlyCollection<Activity> Activities => activities;
    public IReadOnlyCollection<Milestone> Milestones => milestones;
    public IReadOnlyCollection<Document> Documents => documents;

    private Shipment() { }

    private Shipment(
        Guid id,
        string trackingId,
        Cargo cargo,
        Address originAddress,
        GeoLocation originLocation,
        Address destinationAddress,
        GeoLocation destinationLocation,
        DateTime createdAtUtc,
        DateTime? estimatedDeliveryDateUtc)
        : base(id)
    {
        TrackingId = trackingId;
        Cargo = cargo;
        OriginAddress = originAddress;
        OriginLocation = originLocation;
        DestinationAddress = destinationAddress;
        DestinationLocation = destinationLocation;
        CreatedAtUtc = createdAtUtc;
        EstimatedDeliveryDateUtc = estimatedDeliveryDateUtc;

        Status = ShipmentStatus.Unassigned;
    }

    public static Shipment CreateDraft(
        Guid id,
        string trackingId,
        Cargo cargo,
        Address originAddress,
        GeoLocation originLocation,
        Address destinationAddress,
        GeoLocation destinationLocation,
        DateTime createdAtUtc,
        DateTime? estimatedDeliveryDateUtc,
        Guid managerId,
        DateTime timestampUtc)
    {
        var shipment = new Shipment(
            id,
            trackingId,
            cargo,
            originAddress,
            originLocation,
            destinationAddress,
            destinationLocation,
            createdAtUtc,
            estimatedDeliveryDateUtc);

        shipment.AddActivity(managerId, ActivityType.Created, "Shipment created", timestampUtc);
        return shipment;
    }

    public ErrorOr<Success> Assign(Guid managerId, Guid driverId, Guid truckId, DateTime timestampUtc)
    {
        if (Status != ShipmentStatus.Unassigned)
            return Error.Conflict("Shipment.AssignError", "Shipment must be unassigned to assign driver and truck.");

        DriverId = driverId;
        TruckId = truckId;
        Status = ShipmentStatus.Assigned;
        UpdatedAtUtc = timestampUtc;

        AddActivity(managerId, ActivityType.Assigned, "Shipment assigned", timestampUtc);
        return Result.Success;
    }

    public ErrorOr<Success> Start(Guid driverId, DateTime timestampUtc)
    {
        if (Status != ShipmentStatus.Assigned)
            return Error.Conflict("Shipment.InvalidStatus", "Shipment must be assigned to start.");

        if (DriverId != driverId)
            return Error.Forbidden("Shipment.Unauthorized", "Only assigned driver can start the shipment.");

        Status = ShipmentStatus.InTransit;
        StartedAtUtc = timestampUtc;
        UpdatedAtUtc = timestampUtc;

        AddActivity(driverId, ActivityType.Started, "Shipment started", timestampUtc);
        return Result.Success;
    }

    public ErrorOr<Success> AddMilestone(Guid driverId, double lat, double lon, string note, DateTime timestampUtc)
    {
        if (Status != ShipmentStatus.InTransit)
            return Error.Conflict("Shipment.InvalidStatus", "Milestones can only be added while in transit.");

        if (DriverId != driverId)
            return Error.Forbidden("Shipment.Unauthorized", "Only the assigned driver can add milestones.");

        var milestone = new Milestone(Guid.NewGuid(), Id, driverId, note, lat, lon, timestampUtc);
        milestones.Add(milestone);

        AddActivity(driverId, ActivityType.MilestoneAdded, $"Milestone: {note}", timestampUtc);
        return Result.Success;
    }

    public ErrorOr<Success> Deliver(Guid driverId, string proofOfDeliveryUrl, DateTime timestampUtc)
    {
        if (Status != ShipmentStatus.InTransit)
            return Error.Validation("Shipment.InvalidStatus",
             "Shipment must be in-transit to deliver.");

        if (DriverId != driverId)
            return Error.Forbidden("Shipment.Unauthorized",
            "Only assigned driver can deliver.");

        Status = ShipmentStatus.Delivered;
        DeliveredAtUtc = timestampUtc;
        UpdatedAtUtc = timestampUtc;

        var pod = new Document(Guid.NewGuid(), Id, driverId, DocumentType.ProofOfDelivery, proofOfDeliveryUrl, timestampUtc);
        documents.Add(pod);

        AddActivity(driverId, ActivityType.Delivered, "Shipment delivered", timestampUtc);
        return Result.Success;
    }   

    public ErrorOr<Success> Cancel(Guid managerId, DateTime timestampUtc)
    {
        if (Status == ShipmentStatus.Delivered)
        {
            return Error.Conflict(
                code: "Shipment.InvalidStatus",
                description: "Shipment cannot be cancelled after it is delivered."
            );
        }

        Status = ShipmentStatus.Cancelled;
        UpdatedAtUtc = timestampUtc;

        // domain rule: driver/truck released will be handled in application layer
        AddActivity(managerId, ActivityType.Cancelled, "Shipment cancelled", timestampUtc);

        return Result.Success;
    }

    private void AddActivity(Guid employeeId, ActivityType type, string description, DateTime timestampUtc)
    {
        var activity = new Activity(
            Guid.NewGuid(),
            Id,
            employeeId,
            type,
            description,
            timestampUtc);

        activities.Add(activity);
    }
}


