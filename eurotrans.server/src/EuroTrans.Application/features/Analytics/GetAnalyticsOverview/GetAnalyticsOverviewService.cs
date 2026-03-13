using System.Globalization;
using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Analytics.GetAnalyticsOverview;

public class GetAnalyticsOverviewService
{
    private const int TrendWindowDays = 14;
    private const int WorkloadLimit = 8;

    private readonly IAnalyticsRepository analytics;
    private readonly IDateTimeProvider clock;
    private readonly IQueryCache cache;

    public GetAnalyticsOverviewService(
        IAnalyticsRepository analytics,
        IDateTimeProvider clock,
        IQueryCache cache)
    {
        this.analytics = analytics;
        this.clock = clock;
        this.cache = cache;
    }

    public Task<ErrorOr<AnalyticsOverviewResponse>> GetAsync(CancellationToken ct = default)
    {
        var shipmentVersion = cache.GetVersion(QueryCacheScopes.Shipments);
        var driverVersion = cache.GetVersion(QueryCacheScopes.Drivers);
        var key = $"analytics:overview:shipments-v{shipmentVersion}:drivers-v{driverVersion}";

        return cache.GetOrCreateAsync(
            key,
            QueryCacheTtls.Analytics,
            async token =>
            {
                var todayUtc = clock.UtcNow.Date;
                var fromUtc = todayUtc.AddDays(-(TrendWindowDays - 1));
                var toUtcExclusive = todayUtc.AddDays(1);

                var overview = await analytics.GetOverviewAsync(fromUtc, toUtcExclusive, WorkloadLimit, token);
                var shipmentsByDate = overview.ShipmentsOverTime.ToDictionary(item => item.Date.Date, item => item.Count);

                var shipmentsOverTime = Enumerable.Range(0, TrendWindowDays)
                    .Select(offset => fromUtc.AddDays(offset))
                    .Select(date => new AnalyticsOverviewShipmentTrendResponse(
                        Date: date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                        Label: date.ToString("MMM d", CultureInfo.InvariantCulture),
                        Count: shipmentsByDate.GetValueOrDefault(date, 0)))
                    .ToList();

                var driverWorkload = overview.DriverWorkloadDistribution
                    .Select(item => new AnalyticsOverviewDriverWorkloadResponse(
                        DriverName: item.DriverName,
                        Assigned: item.Assigned,
                        InTransit: item.InTransit,
                        Total: item.Total))
                    .ToList();

                return (ErrorOr<AnalyticsOverviewResponse>)new AnalyticsOverviewResponse(
                    TotalShipments: overview.TotalShipments,
                    ActiveShipments: overview.ActiveShipments,
                    DeliveredShipments: overview.DeliveredShipments,
                    AvgDeliveryTime: FormatAverageDeliveryTime(overview.AverageDeliveryHours),
                    ActiveDrivers: overview.ActiveDrivers,
                    AvailableDrivers: overview.AvailableDrivers,
                    ShipmentsOverTime: shipmentsOverTime,
                    DriverWorkloadDistribution: driverWorkload);
            },
            ct);
    }

    private static string FormatAverageDeliveryTime(double? averageDeliveryHours)
    {
        if (!averageDeliveryHours.HasValue)
            return "N/A";

        var duration = TimeSpan.FromHours(averageDeliveryHours.Value);
        if (duration.TotalDays >= 1)
            return $"{(int)duration.TotalDays}d {duration.Hours}h";

        if (duration.TotalHours >= 1)
            return $"{Math.Max((int)duration.TotalHours, 1)}h {duration.Minutes}m";

        return $"{Math.Max(duration.Minutes, 1)}m";
    }
}
