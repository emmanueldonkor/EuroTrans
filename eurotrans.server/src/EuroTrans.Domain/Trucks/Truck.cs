using EuroTrans.Domain.Common;

namespace EuroTrans.Domain.Trucks;

public class Truck : AggregateRoot
{
    public string PlateNumber { get; private set; } = string.Empty;
    public string Model { get; private set; } = string.Empty;
    public float Capacity { get; private set; }
    public TruckStatus Status { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }

    private Truck() { }

    public Truck(Guid id, string plateNumber, string model, float capacity, DateTime createdAtUtc)
        : base(id)
    {
        PlateNumber = plateNumber;
        Model = model;
        Capacity = capacity;
        Status = TruckStatus.Available;
        CreatedAtUtc = createdAtUtc;
    }

    public void MarkAvailable() => Status = TruckStatus.Available;
    public void MarkInUse() => Status = TruckStatus.InUse;
    public void MarkMaintenance() => Status = TruckStatus.Maintenance;
}

