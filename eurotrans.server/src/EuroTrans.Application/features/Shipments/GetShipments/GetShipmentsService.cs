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

        if (currentUser.IsDriver)
        {
            var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
            if (employeeIdResult.IsError)
                return employeeIdResult.Errors;

            driverFilter = employeeIdResult.Value;
        }

        var (queryItems, totalCount) = await shipments.GetFilteredAsync(
            status: request.Status,
            driverId: driverFilter,
            startDate: request.StartDate,
            endDate: request.EndDate,
            search: request.Search,
            page: request.Page,
            pageSize: request.PageSize,
            ct: ct
        );

        var items = queryItems
            .Select(item => new GetShipmentsItemResponse(
                item.Id,
                item.TrackingId,
                item.Status,
                item.DriverName,
                FormatLocation(item.OriginCity, item.OriginCountry),
                FormatLocation(item.DestinationCity, item.DestinationCountry),
                item.UpdatedAtUtc
            ))
            .ToList();

        return new GetShipmentsResponse(
            Items: items,
            TotalCount: totalCount,
            Page: request.Page,
            PageSize: request.PageSize
        );
    }

    private static string FormatLocation(string? city, string? country)
    {
        if (string.IsNullOrWhiteSpace(city) && string.IsNullOrWhiteSpace(country))
            return "Unknown";

        if (string.IsNullOrWhiteSpace(city))
            return country!;

        if (string.IsNullOrWhiteSpace(country))
            return city;

        return $"{city}, {country}";
    }
}
