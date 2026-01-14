using EuroTrans.Application.features.Shipments.Milestone;
using FluentValidation;

namespace EuroTrans.Api.Endpoints.Shipments;

public static class MilestoneEndpoint
{
    public static void MapAddMilestoneEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/shipments/{id}/milestones", async (
            Guid id,
            MilestoneRequest request,
            MilestoneService service,
            IValidator<MilestoneRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
                return Results.BadRequest(validation.Errors);

            await service.AddAsync(id, request);
            return Results.Ok();
        })
        .RequireAuthorization("driver");
    }
}
