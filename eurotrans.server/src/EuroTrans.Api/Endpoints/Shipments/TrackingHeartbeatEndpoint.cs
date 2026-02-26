using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Shipments.Tracking;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Shipments;

[ApiEndpoint]
public static class TrackingHeartbeatEndpoint
{
    public static void MapTrackingHeartbeatEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/shipments/{id}/tracking/heartbeat", async (
            Guid id,
            TrackingHeartbeatRequest request,
            [FromServices] TrackingHeartbeatService service,
            IValidator<TrackingHeartbeatRequest> validator,
            CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await service.AddAsync(id, request, ct);
            return result.Match(
                _ => Results.Ok(),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("driver", "write:shipments");
    }
}
