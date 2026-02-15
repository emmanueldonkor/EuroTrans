using EuroTrans.Application.features.Shipments.GetShipmentActivities;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Shipments;

public static class GetShipmentActivitiesEndpoint
{
    public static void MapGetShipmentActivitiesEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/shipments/{id}/activities", async (
            Guid id,
          [FromServices]  GetShipmentActivitiesService service,
            CancellationToken ct,
            IValidator<Guid> validator) =>
        {
            var validation = await validator.ValidateAsync(id, ct);
            if (!validation.IsValid)
                return Results.BadRequest(validation.Errors);

            var result = await service.GetAsync(id, ct);
            return Results.Ok(result);
        })
        .RequireAuthorization("read:shipment");;
    }
}
