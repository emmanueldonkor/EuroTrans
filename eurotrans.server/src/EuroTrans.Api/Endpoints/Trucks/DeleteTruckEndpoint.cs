using EuroTrans.Application.features.Trucks.DeleteTruck;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Trucks;

public static class DeleteTruckEndpoint
{
    public static void MapDeleteTruckEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/trucks/{id}", async (
            Guid id,
          [FromServices]  DeleteTruckService service,
            CancellationToken ct) =>
        {
            await service.DeleteAsync(id, ct);
            return Results.NoContent();
        })
        .RequireAuthorization("manager", "write:trucks");
    }
}
