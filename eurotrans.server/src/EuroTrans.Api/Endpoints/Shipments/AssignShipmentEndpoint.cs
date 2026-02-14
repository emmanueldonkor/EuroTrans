using EuroTrans.Application.features.Shipments.AssignShipment;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Shipments;

public static class AssignShipmentEndpoint
{
    public static void MapAssignShipmentEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/shipments/{id}/assign", async (Guid id, AssignShipmentRequest request,[FromServices] AssignShipmentService service, IValidator<AssignShipmentRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
            {
                return Results.BadRequest(validation.Errors);
            }

            await service.AssignAsync(id, request);
            return Results.Ok();
        })
        .RequireAuthorization("manager", "shipments:write");;
    }
}
