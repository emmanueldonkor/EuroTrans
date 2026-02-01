using ErrorOr;
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

    public async Task<ErrorOr<List<GetShipmentActivitiesResponse>>> GetAsync(Guid shipmentId)
    {
        var shipment = await shipments.GetByIdAsync(shipmentId);

        if (shipment is null)
            return Error.NotFound(description: "Shipment not found.");

        if (currentUser.IsDriver && shipment.DriverId != currentUser.Id)
            return Error.Forbidden(description: "You are not allowed to view this shipment.");

        return shipment.Activities
            .OrderBy(a => a.TimestampUtc)
            .Select(a => new GetShipmentActivitiesResponse(
                a.Id,
                a.EmployeeId,
                a.Type,
                a.Description,
                a.TimestampUtc
            ))
            .ToList();
    }
}
