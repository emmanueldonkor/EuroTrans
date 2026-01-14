using EuroTrans.Application.features.Shipments.DeliverShipment;
using FluentValidation;

namespace EuroTrans.Api.Endpoints.Shipments;

public static class DeliverShipmentEndpoint
{
    public static void MapDeliverShipmentEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/shipments/{id}/deliver", async (
            Guid id,
            DeliverShipmentRequest request,
            DeliverShipmentService service,
            IValidator<DeliverShipmentRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
                return Results.BadRequest(validation.Errors);

            await service.DeliverAsync(id, request);
            return Results.Ok();
        })
        .RequireAuthorization("driver");
    }
}
