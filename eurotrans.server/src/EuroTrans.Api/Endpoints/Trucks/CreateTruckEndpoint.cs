using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Trucks.CreateTruck;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Trucks;

[ApiEndpoint]
public static class CreateTruckEndpoint
{
    public static void MapCreateTruckEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/trucks", async (
            CreateTruckRequest request,
           [FromServices] CreateTruckService service,
            CancellationToken ct,
            IValidator<CreateTruckRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await service.CreateAsync(request, ct);
            return result.Match(
                id => Results.Created($"/api/trucks/{id}", new { Id = id }),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("manager", "write:trucks");
    }
}
