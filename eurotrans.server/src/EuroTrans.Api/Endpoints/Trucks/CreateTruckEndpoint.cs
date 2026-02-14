using EuroTrans.Application.features.Trucks.CreateTruck;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Trucks;

public static class CreateTruckEndpoint
{
    public static void MapCreateTruckEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/trucks", async (
            CreateTruckRequest request,
           [FromServices] CreateTruckService service,
            IValidator<CreateTruckRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
                return Results.BadRequest(validation.Errors);

            var id = await service.CreateAsync(request);
            return Results.Created($"/api/trucks/{id}", new { Id = id });
        })
        .RequireAuthorization("manager");
    }
}
