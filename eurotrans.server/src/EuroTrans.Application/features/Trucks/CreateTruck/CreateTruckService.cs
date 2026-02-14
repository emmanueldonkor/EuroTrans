using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks.CreateTruck;

public class CreateTruckService
{
    private readonly ITruckRepository trucks;
    private readonly IUnitOfWork uow;

    public CreateTruckService(ITruckRepository trucks, IUnitOfWork uow)
    {
        this.trucks = trucks;
        this.uow = uow;
    }

    public async Task<Guid> CreateAsync(CreateTruckRequest request)
    {
        var truck = new Truck(
            id: Guid.NewGuid(),
            plateNumber: request.PlateNumber,
            model: request.Model,
            capacity: request.Capacity,
            createdAtUtc: DateTime.UtcNow,
            status: request.Status
        );

        await trucks.AddAsync(truck);
        await uow.SaveChangesAsync();

        return truck.Id;
    }
}
