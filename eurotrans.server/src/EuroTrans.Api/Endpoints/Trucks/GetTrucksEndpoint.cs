using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Trucks.GetTrucks;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Trucks;

public static class GetTrucksEndpoint
{
    public static void MapGetTrucksEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/trucks", async ([FromServices] GetTrucksService service, CancellationToken ct) =>
        {
            var result = await service.GetAsync(ct);
            return result.Match(
                trucks => Results.Ok(trucks),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("manager", "read:trucks");
    }
}
