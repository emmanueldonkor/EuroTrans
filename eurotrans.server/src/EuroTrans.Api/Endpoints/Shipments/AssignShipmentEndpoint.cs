using EuroTrans.Application.features.Shipments.AssignShipment;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Shipments;

public static class AssignShipmentEndpoint
{
    public static void MapAssignShipmentEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/shipments/{id}/assign", async (Guid id, AssignShipmentRequest request,[FromServices] AssignShipmentService service, CancellationToken ct, IValidator<AssignShipmentRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
            {
                return Results.BadRequest(validation.Errors);
            }

            await service.AssignAsync(id, request, ct);
            return Results.Ok();
        })
        .RequireAuthorization("manager", "write:shipments");;
    }
}
