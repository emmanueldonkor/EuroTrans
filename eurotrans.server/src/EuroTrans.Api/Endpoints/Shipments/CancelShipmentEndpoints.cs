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
                return Results.BadRequest(validation.Errors);

            await service.CancelAsync(id);
            return Results.Ok();
        })
        .RequireAuthorization("manager", "shipments:write");;
    }
}
