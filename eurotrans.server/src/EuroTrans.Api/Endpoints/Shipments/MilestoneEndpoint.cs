using EuroTrans.Application.features.Shipments.Milestone;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Shipments;

public static class MilestoneEndpoint
{
    public static void MapAddMilestoneEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/shipments/{id}/milestones", async (
            Guid id,
            MilestoneRequest request,
          [FromServices]  MilestoneService service,
            CancellationToken ct,
            IValidator<MilestoneRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.BadRequest(validation.Errors);

            await service.AddAsync(id, request, ct);
            return Results.Ok();
        })
         .RequireAuthorization("driver", "write:shipments");;
    }
}
