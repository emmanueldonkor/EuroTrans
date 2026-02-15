using ErrorOr;
using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Shipments.Milestone;

public class MilestoneService
{
    private readonly IShipmentRepository shipments;
    private readonly IUnitOfWork uow;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;

    public MilestoneService(
       IShipmentRepository shipments,
       IUnitOfWork uow,
       ICurrentEmployeeProvider currentEmployeeProvider,
       IDateTimeProvider clock)
    {
        this.shipments = shipments;
        this.uow = uow;
        this.currentEmployeeProvider = currentEmployeeProvider;
        this.clock = clock;
    }

    public async Task<ErrorOr<Success>> AddAsync(Guid shipmentId, MilestoneRequest request, CancellationToken ct = default)
    {
        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
            return employeeIdResult.Errors;

        var shipment = await shipments.GetByIdAsync(shipmentId, ct);
        if (shipment is null)
            return Error.NotFound(description: "Shipment not found.");

        var result = shipment.AddMilestone(
            driverId: employeeIdResult.Value,
            lat: request.Latitude,
            lon: request.Longitude,
            note: request.Note,
            timestampUtc: clock.UtcNow
        );

        if (result.IsError)
            return result.Errors;

        await uow.SaveChangesAsync(ct);

        return Result.Success;
    }
}
