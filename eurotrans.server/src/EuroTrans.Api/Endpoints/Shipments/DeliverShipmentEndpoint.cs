using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Shipments.DeliverShipment;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Shipments;

[EuroTrans.Api.Endpoints.ApiEndpoint]
public static class DeliverShipmentEndpoint
{
    public static void MapDeliverShipmentEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/shipments/{id}/deliver", async (
            Guid id,
            IFormFile file,
            [FromServices] DeliverShipmentService service,
            CancellationToken ct) =>
        {
            if (file == null || file.Length == 0)
                return Results.BadRequest("Proof of delivery file is required.");

            using var stream = file.OpenReadStream();
            var result = await service.DeliverAsync(id, stream, file.FileName, file.ContentType, ct);

            return result.Match(
                _ => Results.Ok(new { message = "Shipment delivered" }),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("driver", "write:shipments")
        .DisableAntiforgery();
    }
}
