using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Analytics.GetAnalyticsOverview;

namespace EuroTrans.Api.Endpoints.Analytics;

[ApiEndpoint]
public static class GetAnalyticsOverviewEndpoint
{
    public static void MapGetAnalyticsOverviewEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/analytics/overview", async (
            GetAnalyticsOverviewService service,
            CancellationToken ct) =>
        {
            var result = await service.GetAsync(ct);
            return result.Match(
                overview => Results.Ok(overview),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("manager");
    }
}
