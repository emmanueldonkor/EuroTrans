using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Trucks;

namespace EuroTrans.Application.features.Shipments.CancelShipment;

public class CancelShipmentService
{
    private readonly IShipmentRepository shipments;
    private readonly IEmployeeRepository drivers;
    private readonly ITruckRepository trucks;
    private readonly IUnitOfWork uow;
    private readonly ICurrentUser currentUser;
    private readonly IDateTimeProvider clock;

    public CancelShipmentService(
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

    public async Task CancelAsync(Guid shipmentId)
    {
        if (!currentUser.IsManager)
            throw new DomainException("Only managers can cancel shipments.");

        var shipment = await shipments.GetByIdAsync(shipmentId)
            ?? throw new DomainException("Shipment not found.");

        // DOMAIN LOGIC
        shipment.Cancel(currentUser.Id, clock.UtcNow);

        // If shipment was assigned, release driver + truck
        if (shipment.DriverId.HasValue)
        {
            var driver = await drivers.GetByIdAsync(shipment.DriverId.Value);
            driver.SetAvailable();
        }

        if (shipment.TruckId.HasValue)
        {
            var truck = await trucks.GetByIdAsync(shipment.TruckId.Value);
            truck.MarkAvailable();
        }

        await uow.SaveChangesAsync();
    }
}
