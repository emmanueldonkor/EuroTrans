using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks.CreateTruck;

public class CreateTruckService
{
    private readonly ITruckRepository trucks;
    private readonly IUnitOfWork uow;
    private readonly IDateTimeProvider clock;

    public CreateTruckService(ITruckRepository trucks, IUnitOfWork uow, IDateTimeProvider clock)
    {
        this.trucks = trucks;
        this.uow = uow;
        this.clock = clock;
    }

    public async Task<ErrorOr<Guid>> CreateAsync(CreateTruckRequest request, CancellationToken ct = default)
    {
        var truck = new Truck(
            id: Guid.NewGuid(),
            plateNumber: request.PlateNumber,
            model: request.Model,
            capacity: request.Capacity,
            createdAtUtc: clock.UtcNow,
            status: request.Status
        );

        await trucks.AddAsync(truck, ct);
        await uow.SaveChangesAsync(ct);

        return truck.Id;
    }
}
