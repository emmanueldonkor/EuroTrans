using EuroTrans.Application.features.Trucks.UpdateTruck;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Trucks;

public static class UpdateTruckStatusEndpoint
{
    public static void MapUpdateTruckStatusEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPut("/api/trucks/{id}/status", async (
            Guid id,
            UpdateTruckStatusRequest request,
          [FromServices]  UpdateTruckStatusService service,
            CancellationToken ct) =>
        {
            await service.UpdateAsync(id, request.Status, ct);
            return Results.NoContent();
        })
        .RequireAuthorization("manager", "write:trucks");
    }
}
