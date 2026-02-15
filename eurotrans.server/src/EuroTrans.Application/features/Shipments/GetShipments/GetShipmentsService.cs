using ErrorOr;
using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Shipments.GetShipments;

public class GetShipmentsService
{
    private readonly IShipmentRepository shipments;
    private readonly ICurrentUser currentUser;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;

    public GetShipmentsService(
        IShipmentRepository shipments,
        ICurrentUser currentUser,
        ICurrentEmployeeProvider currentEmployeeProvider)
    {
        this.shipments = shipments;
        this.currentUser = currentUser;
        this.currentEmployeeProvider = currentEmployeeProvider;
    }

    public async Task<ErrorOr<List<GetShipmentResponse>>> GetAsync(GetShipmentsRequest request, CancellationToken ct = default)
    {
        Guid? driverFilter = request.DriverId;

        // Drivers can ONLY see their own shipments
        if (currentUser.IsDriver)
        {
            var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
            if (employeeIdResult.IsError)
                return employeeIdResult.Errors;

            driverFilter = employeeIdResult.Value;
        }

        // Managers can filter by driverId if they want
        // If manager doesn't pass driverId, it stays null

        var shipments = await this.shipments.GetFilteredAsync(
            status: request.Status,
            driverId: driverFilter,
            startDate: request.StartDate,
            endDate: request.EndDate,
            search: request.Search, 
            ct: ct
        );

        return shipments.Select(s => new GetShipmentResponse(
            s.Id,
            s.TrackingId,
            s.Status,
            s.Cargo!.Description,
            s.CreatedAtUtc,
            s.EstimatedDeliveryDateUtc,
            s.DriverId,
            s.TruckId
        )).ToList();
    }
}
