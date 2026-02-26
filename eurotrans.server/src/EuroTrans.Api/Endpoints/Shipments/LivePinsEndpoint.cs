using EuroTrans.Application.features.Shipments.Tracking;

namespace EuroTrans.Api.Endpoints.Shipments;

[ApiEndpoint]
public static class LivePinsEndpoint
{
    public static void MapLivePinsEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/shipments/live-pins", async (
            GetLivePinsService service,
            CancellationToken ct) =>
        {
            var pins = await service.GetAsync(ct);
            return Results.Ok(pins);
        })
        .RequireAuthorization("read:shipments");
    }
}
