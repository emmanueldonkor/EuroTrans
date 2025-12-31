using EuroTrans.Domain.Common;
using EuroTrans.Domain.Enums;

namespace EuroTrans.Domain.Trucks;

public static class TruckRules
{
    public static void CanAssign(Truck truck)
    {
        if (truck.Status != TruckStatus.Available)
            throw new DomainException("Truck is not available.");
    }

    public static void CanUpdate(Truck truck)
    {
        if (truck.Status == TruckStatus.InUse)
            throw new DomainException("Truck currently in use.");
    }

    public static void CanDelete(Truck truck)
    {
        if (truck.Status == TruckStatus.InUse)
            throw new DomainException("Truck currently in use.");
    }
}