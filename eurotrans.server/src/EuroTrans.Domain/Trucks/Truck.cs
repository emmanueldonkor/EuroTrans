using EuroTrans.Domain.Enums;
using EuroTrans.Domain.Shipments;

namespace EuroTrans.Domain.Trucks;

public class Truck
{
    public Guid Id { get; set; }

    public string PlateNumber { get; set; } = null!;
    public string Model { get; set; } = null!;
    public float Capacity { get; set; }
    public TruckStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation
    public ICollection<Shipment> Shipments { get; set; } = [];

    public void Assign()
    {
        TruckRules.CanAssign(this);
        Status = TruckStatus.InUse;
    }

    public void Release()
    {
        Status = TruckStatus.Available;
    }

    public void UpdateDetails(string model, float capacity)
    {
        TruckRules.CanUpdate(this);

        Model = model;
        Capacity = capacity;
    }

    public void EnsureCanDelete()
    {
        TruckRules.CanDelete(this);
    }
}
