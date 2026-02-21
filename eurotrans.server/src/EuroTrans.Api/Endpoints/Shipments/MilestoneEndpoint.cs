using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Shipments.Milestone;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Shipments;

[ApiEndpoint]
public static class MilestoneEndpoint
{
    public static void MapAddMilestoneEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/shipments/{id}/milestones", async (
            Guid id,
            MilestoneRequest request,
          [FromServices] MilestoneService service,
            CancellationToken ct,
            IValidator<MilestoneRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await service.AddAsync(id, request, ct);
            return result.Match(
                _ => Results.Ok(),
                errors => errors.ToProblem());
        })
         .RequireAuthorization("driver", "write:shipments"); ;
    }
}
