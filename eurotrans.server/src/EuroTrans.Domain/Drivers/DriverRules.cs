using EuroTrans.Domain.Common;
using EuroTrans.Domain.Enums;

namespace EuroTrans.Domain.Drivers;

public static class DriverRules
{
    public static void CanAssign(Driver driver)
    {
        if (driver.Status != DriverStatus.Available)
            throw new DomainException("Driver is not available.");

        if (driver.CurrentShipmentId != null)
            throw new DomainException("Driver already assigned to a shipment.");
    }

    public static void CanChangeStatus(Driver driver)
    {
        if (driver.Status == DriverStatus.OnDuty)
            throw new DomainException("Cannot change status while driver is on duty.");
    }   
}