using ErrorOr;
using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Shipments.Milestone;

public class MilestoneService
{
    private readonly IShipmentRepository shipments;
    private readonly IUnitOfWork uow;
    private readonly ICurrentUser currentUser;
    private readonly IDateTimeProvider clock;

    public MilestoneService(
       IShipmentRepository shipments,
       IUnitOfWork uow,
       ICurrentUser currentUser,
       IDateTimeProvider clock)
    {
        this.shipments = shipments;
        this.uow = uow;
        this.currentUser = currentUser;
        this.clock = clock;
    }

    public async Task<ErrorOr<Success>> AddAsync(Guid shipmentId, MilestoneRequest request)
    {
        if (!currentUser.IsDriver)
            return Error.Forbidden(description: "Only drivers can add milestones.");

        var shipment = await shipments.GetByIdAsync(shipmentId);
        if (shipment is null)
            return Error.NotFound(description: "Shipment not found.");

        var result = shipment.AddMilestone(
            driverId: currentUser.Id,
            lat: request.Latitude,
            lon: request.Longitude,
            note: request.Note,
            timestampUtc: clock.UtcNow
        );

        if (result.IsError)
            return result.Errors;

        await uow.SaveChangesAsync();

        return Result.Success;
    }
}
