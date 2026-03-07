using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Trucks.GetTruckOptions;

namespace EuroTrans.Api.Endpoints.Trucks;

[ApiEndpoint]
public static class GetTruckOptionsEndpoint
{
    public static void MapGetTruckOptionsEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/trucks/options", async (
            GetTruckOptionsService service,
            CancellationToken ct) =>
        {
            var result = await service.GetAsync(ct);
            return result.Match(
                trucks => Results.Ok(trucks),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("manager", "read:trucks");
    }
}
