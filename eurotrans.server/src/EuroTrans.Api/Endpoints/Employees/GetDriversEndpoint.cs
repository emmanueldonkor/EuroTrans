using EuroTrans.Application.features.Employees.Drivers.GetDrivers;

namespace EuroTrans.Api.Endpoints.Employees;

public static class GetDriversEndpoint
{
    public static void MapGetDriversEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/drivers", async (
            GetDriversService service) =>
        {
            var result = await service.GetAsync();
            return Results.Ok(result);
        })
        .RequireAuthorization("manager"); 
    }
}
