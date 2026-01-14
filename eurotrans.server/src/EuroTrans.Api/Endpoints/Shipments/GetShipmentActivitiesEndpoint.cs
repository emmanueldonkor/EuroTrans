using EuroTrans.Application.features.Shipments.GetShipmentActivities;
using FluentValidation;

namespace EuroTrans.Api.Endpoints.Shipments;

public static class GetShipmentActivitiesEndpoint
{
    public static void MapGetShipmentActivitiesEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/shipments/{id}/activities", async (
            Guid id,
            GetShipmentActivitiesService service,
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
