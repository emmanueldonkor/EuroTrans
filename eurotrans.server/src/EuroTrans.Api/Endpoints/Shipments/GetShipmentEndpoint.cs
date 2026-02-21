using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Shipments.GetShipment;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Shipments;

[ApiEndpoint]
public static class GetShipmentEndpoint
{
    public static void MapGetShipmentEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/shipments/{id}", async (
            Guid id,
          [FromServices] GetShipmentService service,
            CancellationToken ct,
            IValidator<GetShipmentRequest> validator) =>
        {
            var request = new GetShipmentRequest(id);
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await service.GetAsync(request.ShipmentId, ct);
            return result.Match(
                shipment => Results.Ok(shipment),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("read:shipments");
    }
}
