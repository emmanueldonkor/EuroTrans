using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Shipments.GetShipmentActivities;

public class GetShipmentActivitiesService
{
    private readonly IShipmentRepository shipments;
    private readonly ICurrentUser currentUser;

    public GetShipmentActivitiesService(
        IShipmentRepository shipments,
        ICurrentUser currentUser)
    {
        this.shipments = shipments;
        this.currentUser = currentUser;
    }

    public async Task<List<GetShipmentActivitiesResponse>> GetAsync(Guid shipmentId)
    {
        var shipment = await shipments.GetByIdAsync(shipmentId)
            ?? throw new DomainException("Shipment not found.");

        // Drivers can only view their own shipments
        if (currentUser.IsDriver && shipment.DriverId != currentUser.Id)
            throw new DomainException("You are not allowed to view this shipment.");

        return shipment.Activities
            .OrderBy(a => a.TimestampUtc)
            .Select(a => new GetShipmentActivitiesResponse(
                a.Id,
                a.Type,
                a.Description,
                a.CreatedByEmployeeId,
                a.TimestampUtc
            ))
            .ToList();
    }
}
