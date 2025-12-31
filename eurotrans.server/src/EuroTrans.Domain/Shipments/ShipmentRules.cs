using EuroTrans.Domain.Common;
using EuroTrans.Domain.Enums;

namespace EuroTrans.Domain.Shipments;

public static class ShipmentRules
{
   // ---------- LIFECYCLE ----------

    public static void MustBeDraft(Shipment shipment)
    {
        if (shipment.Status != ShipmentStatus.Draft)
            throw new DomainException("Shipment must be in draft state.");
    }

    public static void MustBeUnassigned(Shipment shipment)
    {
        if (shipment.Status != ShipmentStatus.Unassigned)
            throw new DomainException("Shipment must be unassigned.");
    }

    public static void MustBeInTransit(Shipment shipment)
    {
        if (shipment.Status != ShipmentStatus.InTransit)
            throw new DomainException("Shipment must be in-transit.");
    }

    // ---------- EDIT / DELETE ----------

    public static void CanEdit(Shipment shipment)
    {
        MustBeDraft(shipment);
    }

    public static void CanDelete(Shipment shipment)
    {
        if (shipment.Status == ShipmentStatus.Delivered)
            throw new DomainException("Delivered shipment cannot be deleted.");

        if (shipment.Status == ShipmentStatus.InTransit && shipment.StartedAt != null)
            throw new DomainException("Started shipment cannot be deleted.");
    }

    // ---------- ASSIGNMENT ----------

    public static void CanAssign(Shipment shipment)
    {
        MustBeUnassigned(shipment);

        if (shipment.DriverId != null || shipment.TruckId != null)
            throw new DomainException("Shipment is already assigned.");
    }

    // ---------- JOURNEY ----------

    public static void CanStartJourney(Shipment shipment, Guid driverId)
    {
        MustBeInTransit(shipment);

        if (shipment.StartedAt != null)
            throw new DomainException("Journey already started.");

        if (shipment.DriverId != driverId)
            throw new DomainException("Only assigned driver can start journey.");
    }

    public static void CanUpdateLocation(Shipment shipment)
    {
        MustBeInTransit(shipment);

        if (shipment.StartedAt == null)
            throw new DomainException("Journey not started yet.");
    }

    // ---------- DELIVERY ----------

    public static void CanDeliver(Shipment shipment)
    {
        MustBeInTransit(shipment);

        if (shipment.StartedAt == null)
            throw new DomainException("Journey not started.");

        if (string.IsNullOrWhiteSpace(shipment.ProofOfDeliveryUrl))
            throw new DomainException("Proof of delivery is required.");
    }
}