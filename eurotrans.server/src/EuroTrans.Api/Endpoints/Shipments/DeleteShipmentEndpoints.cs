using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Shipments.DeleteShipment;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Shipments;

[ApiEndpoint]
public static class DeleteShipmentEndpoints
{
    public static void MapDeleteShipmentEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/shipments/{id}/cancel", async (
            Guid id,
            [FromServices] DeleteShipmentService service,
            IValidator<DeleteShipmentRequest> validator,
            CancellationToken ct) =>
        {
            var request = new DeleteShipmentRequest(id);
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await service.DeleteAsync(request.ShipmentId, ct);

            return result.Match(
                _ => Results.Ok(),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("manager", "write:shipments");
    }
}
