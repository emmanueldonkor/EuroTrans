using EuroTrans.Application.features.Shipments.StartShipment;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Shipments;

public static class StartShipmentEndpoint
{
    public static void MapStartShipmentEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/shipments/{id}/start", async (
            Guid id,
           [FromServices] StartShipmentService service,
            IValidator<Guid> validator) =>
        {
            var validation = await validator.ValidateAsync(id);
            if (!validation.IsValid)
                return Results.BadRequest(validation.Errors);

            await service.StartAsync(id);
            return Results.Ok();
        })
         .RequireAuthorization("driver", "shipments:write");;
    }
}
