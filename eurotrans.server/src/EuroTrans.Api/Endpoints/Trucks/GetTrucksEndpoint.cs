using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Trucks.GetTrucks;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Trucks;

[ApiEndpoint]
public static class GetTrucksEndpoint
{
    public static void MapGetTrucksEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/trucks", async (
            [AsParameters] GetTrucksRequest request,
            [FromServices] GetTrucksService service,
            IValidator<GetTrucksRequest> validator,
            CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await service.GetAsync(request, ct);
            return result.Match(
                trucks => Results.Ok(trucks),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("manager", "read:trucks");
    }
}
