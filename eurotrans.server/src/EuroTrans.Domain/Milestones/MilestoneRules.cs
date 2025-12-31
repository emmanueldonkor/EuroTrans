using EuroTrans.Domain.Common;
using EuroTrans.Domain.Enums;
using EuroTrans.Domain.Shipments;

namespace EuroTrans.Domain.Milestones;

public static class MilestoneRules
{
    public static void CanCreate(Shipment shipment, string note)
    {
        if (shipment.Status != ShipmentStatus.InTransit || shipment.StartedAt == null)
            throw new DomainException("Milestones can only be added during active transit.");

        if (string.IsNullOrWhiteSpace(note))
            throw new DomainException("Milestone note is required.");
    } 
}