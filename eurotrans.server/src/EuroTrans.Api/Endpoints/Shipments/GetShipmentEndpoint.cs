using EuroTrans.Application.features.Shipments.GetShipment;
using FluentValidation;

namespace EuroTrans.Api.Endpoints.Shipments;

public static class GetShipmentEndpoint
{
    public static void MapGetShipmentEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/shipments/{id}", async (
            Guid id,
            GetShipmentService service,
            IValidator<Guid> validator) =>
        {
            var validation = await validator.ValidateAsync(id);
            if (!validation.IsValid)
                return Results.BadRequest(validation.Errors);

            var result = await service.GetAsync(id);
            return Results.Ok(result);
        })
        .RequireAuthorization();
    }
}
