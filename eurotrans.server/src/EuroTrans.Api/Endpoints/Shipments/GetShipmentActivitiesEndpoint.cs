using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Shipments.GetShipmentActivities;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Shipments;

[ApiEndpoint]
public static class GetShipmentActivitiesEndpoint
{
    public static void MapGetShipmentActivitiesEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/shipments/{id}/activities", async (
            Guid id,
          [FromServices] GetShipmentActivitiesService service,
            CancellationToken ct,
            IValidator<GetShipmentActivitiesRequest> validator) =>
        {
            var request = new GetShipmentActivitiesRequest(id);
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await service.GetAsync(request.ShipmentId, ct);
            return result.Match(
                activities => Results.Ok(activities),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("read:shipments");
    }
}
