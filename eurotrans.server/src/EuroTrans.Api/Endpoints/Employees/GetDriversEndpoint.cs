using EuroTrans.Application.features.Employees.Drivers.GetDrivers;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Employees;

public static class GetDriversEndpoint
{
    public static void MapGetDriversEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/drivers", async (
         [FromServices]  GetDriversService service,
         CancellationToken ct) =>
        {
            var result = await service.GetAsync(ct);
            return Results.Ok(result);
        })
        .RequireAuthorization("manager", "read:employees"); ; 
    }
}
