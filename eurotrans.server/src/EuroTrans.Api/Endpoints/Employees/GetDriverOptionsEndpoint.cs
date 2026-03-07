using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Employees.Drivers.GetDriverOptions;

namespace EuroTrans.Api.Endpoints.Employees;

[ApiEndpoint]
public static class GetDriverOptionsEndpoint
{
    public static void MapGetDriverOptionsEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/drivers/options", async (
            GetDriverOptionsService service,
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
