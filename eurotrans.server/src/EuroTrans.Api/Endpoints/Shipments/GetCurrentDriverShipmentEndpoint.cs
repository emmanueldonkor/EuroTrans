using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Shipments.GetCurrentDriverShipment;

namespace EuroTrans.Api.Endpoints.Shipments;

[ApiEndpoint]
public static class GetCurrentDriverShipmentEndpoint
{
    public static void MapGetCurrentDriverShipmentEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/drivers/me/current-shipment", async (
            GetCurrentDriverShipmentService service,
            CancellationToken ct) =>
        {
            var result = await service.GetAsync(ct);
            return result.Match(
                shipment => Results.Ok(shipment),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("read:shipments");
    }
}
