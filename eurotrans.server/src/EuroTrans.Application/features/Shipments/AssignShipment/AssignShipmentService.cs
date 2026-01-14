using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Trucks;
using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Shipments.AssignShipment;

public class AssignShipmentService
{
    private readonly IShipmentRepository shipments;
    private readonly IEmployeeRepository drivers;
    private readonly ITruckRepository trucks;
    private readonly IUnitOfWork uow;
    private readonly ICurrentUser currentUser;
    private readonly IDateTimeProvider clock;

    public AssignShipmentService(
        IShipmentRepository shipments,
        IEmployeeRepository drivers,
        ITruckRepository trucks,
        IUnitOfWork uow,
        ICurrentUser currentUser,
        IDateTimeProvider clock)
    {
        this.shipments = shipments;
        this.drivers = drivers;
        this.trucks = trucks;
        this.uow = uow;
        this.currentUser = currentUser;
        this.clock = clock;
    }

    public async Task AssignAsync(Guid shipmentId, AssignShipmentRequest request)
    {
        if (!currentUser.IsManager)
            throw new DomainException("Only managers can assign shipments.");

        var shipment = await shipments.GetByIdAsync(shipmentId)
            ?? throw new DomainException("Shipment not found.");

        var driver = await drivers.GetByIdAsync(request.DriverId)
            ?? throw new DomainException("Driver not found.");

        var truck = await trucks.GetByIdAsync(request.TruckId)
            ?? throw new DomainException("Truck not found.");

        if (driver.Status != DriverStatus.Available)
            throw new DomainException("Driver is not available.");

        if (truck.Status != TruckStatus.Available)
            throw new DomainException("Truck is not available.");

        // DOMAIN LOGIC
        shipment.Assign(currentUser.Id, driver.Id, truck.Id, clock.UtcNow);

        // Update driver + truck
        driver.SetOnDuty();
        truck.MarkInUse();

        await uow.SaveChangesAsync();
    }
}
