using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Shipments.GetShipments;

public class GetShipmentsService
{
    private readonly IShipmentRepository shipments;
    private readonly ICurrentUser currentUser;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IQueryCache cache;

    public GetShipmentsService(
        IShipmentRepository shipments,
        ICurrentUser currentUser,
        ICurrentEmployeeProvider currentEmployeeProvider,
        IQueryCache cache)
    {
        this.shipments = shipments;
        this.currentUser = currentUser;
        this.currentEmployeeProvider = currentEmployeeProvider;
        this.cache = cache;
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

        var version = cache.GetVersion(QueryCacheScopes.Shipments);
        var key = string.Join(":",
            $"shipments:list:v{version}",
            $"status={request.Status?.ToString().ToLowerInvariant() ?? "_"}",
            $"driver={driverFilter?.ToString() ?? "_"}",
            $"start={request.StartDate?.ToUniversalTime().ToString("O") ?? "_"}",
            $"end={request.EndDate?.ToUniversalTime().ToString("O") ?? "_"}",
            $"search={QueryCacheKey.Segment(request.Search)}",
            $"hasPod={request.HasProofOfDelivery?.ToString().ToLowerInvariant() ?? "_"}",
            $"page={request.Page}",
            $"size={request.PageSize}");

        return await cache.GetOrCreateAsync(
            key,
            QueryCacheTtls.Shipments,
            async token =>
            {
                var (queryItems, totalCount) = await shipments.GetFilteredAsync(
                    status: request.Status,
                    driverId: driverFilter,
                    startDate: request.StartDate,
                    endDate: request.EndDate,
                    search: request.Search,
                    hasProofOfDelivery: request.HasProofOfDelivery,
                    page: request.Page,
                    pageSize: request.PageSize,
                    ct: token
                );

                var items = queryItems
                    .Select(item => new GetShipmentsItemResponse(
                        item.Id,
                        item.TrackingId,
                        item.Status,
                        item.DriverName,
                        FormatLocation(item.OriginCity, item.OriginCountry),
                        FormatLocation(item.DestinationCity, item.DestinationCountry),
                        item.UpdatedAtUtc,
                        item.DeliveredAtUtc,
                        item.ProofOfDeliveryUrl
                    ))
                    .ToList();

                return (ErrorOr<GetShipmentsResponse>)new GetShipmentsResponse(
                    Items: items,
                    TotalCount: totalCount,
                    Page: request.Page,
                    PageSize: request.PageSize
                );
            },
            ct);
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
