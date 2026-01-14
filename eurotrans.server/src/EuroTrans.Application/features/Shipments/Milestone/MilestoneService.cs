using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Shipments.Milestone;

public class MilestoneService
{
    private readonly IShipmentRepository shipments;
    private readonly IUnitOfWork uow;
    private readonly ICurrentUser currentUser;
    private readonly IDateTimeProvider clock;

    public AddMilestoneService(
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

    public async Task AddAsync(Guid shipmentId, MilestoneRequest request)
    {
        if (!currentUser.IsDriver)
            throw new DomainException("Only drivers can add milestones.");

        var shipment = await shipments.GetByIdAsync(shipmentId)
            ?? throw new DomainException("Shipment not found.");

        // DOMAIN LOGIC
        shipment.AddMilestone(
            driverId: currentUser.Id,
            latitude: request.Latitude,
            longitude: request.Longitude,
            note: request.Note,
            timestampUtc: clock.UtcNow
        );

        await uow.SaveChangesAsync();
    }
}
