using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Employees.Drivers.GetDrivers;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Employees;

[EuroTrans.Api.Endpoints.ApiEndpoint]
public static class GetDriversEndpoint
{
    public static void MapGetDriversEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/drivers", async (
         [FromServices] GetDriversService service,
         CancellationToken ct) =>
        {
            var result = await service.GetAsync(ct);
            return result.Match(
                drivers => Results.Ok(drivers),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("manager", "read:employees");
    }
}
