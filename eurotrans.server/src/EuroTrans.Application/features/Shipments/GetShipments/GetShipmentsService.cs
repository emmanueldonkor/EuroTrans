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
    public async Task<ErrorOr<GetShipmentsResponse>> GetAsync(
     GetShipmentsRequest request,
     CancellationToken ct = default)
    {
        Guid? driverFilter = request.DriverId;

        // If the current user is a driver, force filter by their employeeId
        if (currentUser.IsDriver)
        {
            var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
            if (employeeIdResult.IsError)
                return employeeIdResult.Errors;

            driverFilter = employeeIdResult.Value;
        }

        // Repository now returns DTOs directly
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

        // No mapping needed — items are already GetShipmentsItemResponse
        return new GetShipmentsResponse(
            Items: items,
            TotalCount: totalCount,
            Page: request.Page,
            PageSize: request.PageSize
        );
    }

}
