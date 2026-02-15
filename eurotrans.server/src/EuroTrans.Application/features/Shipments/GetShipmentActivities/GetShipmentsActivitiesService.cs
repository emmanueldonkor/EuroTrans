using ErrorOr;
using EuroTrans.Application.Common.Interfaces;


namespace EuroTrans.Application.features.Shipments.GetShipmentActivities;

public class GetShipmentActivitiesService
{
    private readonly IShipmentRepository shipments;
    private readonly ICurrentUser currentUser;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;

    public GetShipmentActivitiesService(
        IShipmentRepository shipments,
        ICurrentUser currentUser,
        ICurrentEmployeeProvider currentEmployeeProvider)
    {
        this.shipments = shipments;
        this.currentUser = currentUser;
        this.currentEmployeeProvider = currentEmployeeProvider;
    }

    public async Task<ErrorOr<List<GetShipmentActivitiesResponse>>> GetAsync(Guid shipmentId, CancellationToken ct = default)
    {
        var shipment = await shipments.GetByIdAsync(shipmentId, ct);

        if (shipment is null)
            return Error.NotFound(description: "Shipment not found.");

        if (currentUser.IsDriver)
        {
            var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
            if (employeeIdResult.IsError)
                return employeeIdResult.Errors;

            if (shipment.DriverId != employeeIdResult.Value)
                return Error.Forbidden(description: "You are not allowed to view this shipment.");
        }

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