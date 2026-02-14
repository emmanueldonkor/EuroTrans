using EuroTrans.Application.features.Trucks.DeleteTruck;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Trucks;

public static class DeleteTruckEndpoint
{
    public static void MapDeleteTruckEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/trucks/{id}", async (
            Guid id,
          [FromServices]  DeleteTruckService service) =>
        {
            await service.DeleteAsync(id);
            return Results.NoContent();
        })
        .RequireAuthorization("manager");
    }
}
