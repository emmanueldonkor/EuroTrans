namespace EuroTrans.Application.features.Analytics;

public interface IAnalyticsRepository
{
    Task<AnalyticsOverviewQueryResult> GetOverviewAsync(
        DateTime fromUtc,
        DateTime toUtcExclusive,
        int workloadLimit,
        CancellationToken ct = default);
}
