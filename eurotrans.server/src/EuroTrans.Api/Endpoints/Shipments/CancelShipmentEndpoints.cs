using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Shipments.CancelShipment;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Shipments;

public static class CancelShipmentEndpoint
{
    public static void MapCancelShipmentEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/shipments/{id}/cancel", async (
            Guid id,
          [FromServices]  CancelShipmentService service,
            IValidator<Guid> validator) =>
        {
            var validation = await validator.ValidateAsync(id);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await service.CancelAsync(id);
            return result.Match(
                _ => Results.Ok(),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("manager", "write:shipments");;
    }
}
