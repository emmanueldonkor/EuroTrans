using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Shipments.Tracking;

public class GetLivePinsService
{
    private static readonly TimeSpan StaleThreshold = TimeSpan.FromMinutes(5);
    private readonly IShipmentRepository shipments;
    private readonly IDateTimeProvider clock;

    public GetLivePinsService(IShipmentRepository shipments, IDateTimeProvider clock)
    {
        this.shipments = shipments;
        this.clock = clock;
    }

    public async Task<GetLivePinsPagedResponse> GetAsync(GetLivePinsRequest request, CancellationToken ct = default)
    {
        var now = clock.UtcNow;
        var (pins, totalCount) = await shipments.GetLivePinItemsPagedAsync(request.Page, request.PageSize, ct);

        var items = pins
            .Where(x =>
                x.Latitude.HasValue &&
                x.Longitude.HasValue &&
                x.LastLocationUpdatedAtUtc.HasValue)
            .Select(x => new GetLivePinsResponse(
                ShipmentId: x.ShipmentId,
                TrackingId: x.TrackingId,
                DriverName: string.IsNullOrWhiteSpace(x.DriverName) ? "Unknown" : x.DriverName,
                Cargo: string.IsNullOrWhiteSpace(x.CargoDescription) ? "Shipment cargo" : x.CargoDescription,
                Status: x.Status,
                Latitude: x.Latitude!.Value,
                Longitude: x.Longitude!.Value,
                LastUpdateUtc: x.LastLocationUpdatedAtUtc!.Value,
                IsStale: now - x.LastLocationUpdatedAtUtc!.Value > StaleThreshold))
            .OrderByDescending(x => x.LastUpdateUtc)
            .ToList();

        return new GetLivePinsPagedResponse(
            Items: items,
            TotalCount: totalCount,
            Page: request.Page,
            PageSize: request.PageSize
        );
    }
}
