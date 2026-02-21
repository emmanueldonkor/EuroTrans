using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Shipments.StartShipment;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Shipments;

[ApiEndpoint]
public static class StartShipmentEndpoint
{
    public static void MapStartShipmentEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/shipments/{id}/start", async (
            Guid id,
            [FromServices] StartShipmentService service,
            IValidator<StartShipmentRequest> validator,
            CancellationToken ct) =>
        {
            var request = new StartShipmentRequest(id);
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await service.StartAsync(request.ShipmentId, ct);

            return result.Match(
                _ => Results.Ok(),
                errors => errors.ToProblem()
            );
        })
        .RequireAuthorization("driver", "write:shipments");
    }
}
