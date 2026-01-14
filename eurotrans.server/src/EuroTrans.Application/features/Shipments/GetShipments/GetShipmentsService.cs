using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Shipments.GetShipments;

public class GetShipmentsService
{
    private readonly IShipmentRepository shipments;
    private readonly ICurrentUser currentUser;

    public GetShipmentsService(
        IShipmentRepository shipments,
        ICurrentUser currentUser)
    {
        this.shipments = shipments;
        this.currentUser = currentUser;
    }

    public async Task<List<GetShipmentResponse>> GetAsync(GetShipmentsRequest request)
    {
        Guid? driverFilter = request.DriverId;

        // Drivers can ONLY see their own shipments
        if (currentUser.IsDriver)
            driverFilter = currentUser.Id;

        // Managers can filter by driverId if they want
        // If manager doesn't pass driverId, it stays null

        var shipments = await this.shipments.GetFilteredAsync(
            status: request.Status,
            driverId: driverFilter,
            startDate: request.StartDate,
            endDate: request.EndDate,
            search: request.Search
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
