using EuroTrans.Api.Common.Mapping;
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
            var result = await service.DeleteAsync(id, ct);
            return result.Match(
                _ => Results.NoContent(),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("manager", "write:trucks");
    }
}
