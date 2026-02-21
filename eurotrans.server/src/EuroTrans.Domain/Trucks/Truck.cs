using ErrorOr;
using EuroTrans.Domain.Common;

namespace EuroTrans.Domain.Trucks;

public class Truck : AggregateRoot
{
    public string PlateNumber { get; private set; } = string.Empty;
    public string Model { get; private set; } = string.Empty;
    public float Capacity { get; private set; }
    public TruckStatus Status { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public byte[] RowVersion { get; private set; } = [];

    private Truck() { }

    public Truck(Guid id, string plateNumber, string model, float capacity, DateTime createdAtUtc, TruckStatus status)
        : base(id)
    {
        PlateNumber = plateNumber;
        Model = model;
        Capacity = capacity;
        IsActive = true;
        CreatedAtUtc = createdAtUtc;
        Status = status;
    }

    public void MarkAvailable() => Status = TruckStatus.Available;
    public void MarkInUse() => Status = TruckStatus.InUse;
    public void MarkMaintenance() => Status = TruckStatus.Maintenance;
    public ErrorOr<Success> SetStatus(TruckStatus status)
    {
        if (!IsActive)
            return Error.Conflict("Truck.Inactive", "Inactive trucks cannot be updated.");

        if (status == TruckStatus.InUse)
            return Error.Conflict("Truck.InvalidStatusTransition", "Truck cannot be manually set to InUse.");

        if (Status == TruckStatus.InUse && status != TruckStatus.InUse)
            return Error.Conflict("Truck.InvalidStatusTransition", "Truck status cannot be changed while truck is in use.");

        Status = status;
        return Result.Success;
    }

    public ErrorOr<Success> Retire()
    {
        if (Status == TruckStatus.InUse)
            return Error.Conflict("Truck.InUse", "Truck cannot be retired while in use.");

        IsActive = false;
        return Result.Success;
    }
}

