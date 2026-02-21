using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Trucks.GetTruck;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Trucks;

[ApiEndpoint]
public static class GetTruckEndpoint
{
    public static void MapGetTruckEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/trucks/{id}", async (
            Guid id,
            [FromServices] GetTruckService service,
            IValidator<GetTruckRequest> validator,
            CancellationToken ct) =>
        {
            var request = new GetTruckRequest(id);
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await service.GetAsync(request.TruckId, ct);
            return result.Match(
                truck => Results.Ok(truck),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("manager", "read:trucks");
    }
}
