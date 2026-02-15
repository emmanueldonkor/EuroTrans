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

    public async Task<ErrorOr<GetShipmentsResponse>> GetAsync(GetShipmentsRequest request, CancellationToken ct = default)
    {
        Guid? driverFilter = request.DriverId;

        if (currentUser.IsDriver)
        {
            var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
            if (employeeIdResult.IsError)
                return employeeIdResult.Errors;

            driverFilter = employeeIdResult.Value;
        }

        var (items, totalCount) = await shipments.GetFilteredAsync(
            status: request.Status,
            driverId: driverFilter,
            startDate: request.StartDate,
            endDate: request.EndDate,
            search: request.Search,
            page: request.Page,
            pageSize: request.PageSize,
            ct: ct
        );

        var mappedItems = items.Select(s => new GetShipmentsItemResponse(
            s.Id,
            s.TrackingId,
            s.Status,
            s.Cargo!.Description,
            new AddressSummaryDto(
                s.OriginAddress!.City,
                s.OriginAddress.Country
            ),
            new AddressSummaryDto(
                s.DestinationAddress!.City,
                s.DestinationAddress.Country
            ),
            s.CreatedAtUtc,
            s.UpdatedAtUtc,
            s.EstimatedDeliveryDateUtc,
            s.DriverId,
            s.TruckId
        )).ToList();

        return new GetShipmentsResponse(mappedItems, totalCount, request.Page, request.PageSize);
    }
}
