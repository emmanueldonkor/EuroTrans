using EuroTrans.Application.features.Trucks.GetTrucks;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Trucks;

public static class GetTrucksEndpoint
{
    public static void MapGetTrucksEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/trucks", async ([FromServices] GetTrucksService service, CancellationToken ct) =>
        {
            var trucks = await service.GetAsync(ct);
            return Results.Ok(trucks);
        })
        .RequireAuthorization("manager", "read:trucks");
    }
}
