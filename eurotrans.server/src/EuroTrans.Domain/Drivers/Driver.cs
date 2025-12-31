using EuroTrans.Domain.Employees;
using EuroTrans.Domain.Enums;
using EuroTrans.Domain.Shipments;

namespace EuroTrans.Domain.Drivers;

public class Driver
{
    public Guid Id { get; set; } 

    public string Phone { get; set; } = null!;
    public string LicenseNumber { get; set; } = null!;
    public DriverStatus Status { get; set; }

    public Guid? CurrentShipmentId { get; set; }

    // Navigation
    public Employee Employee { get; set; } = null!;
    public Shipment? CurrentShipment { get; set; }
    public ICollection<Shipment> Shipments { get; set; } = [];

    public void AssignToShipment(Guid shipmentId)
    {
        DriverRules.CanAssign(this);

        CurrentShipmentId = shipmentId;
        Status = DriverStatus.OnDuty;
    }

    public void CompleteShipment()
    {
        CurrentShipmentId = null;
        Status = DriverStatus.Available;
    }

    public void ChangeStatus(DriverStatus newStatus)
    {
        DriverRules.CanChangeStatus(this);
        Status = newStatus;
    }
}
