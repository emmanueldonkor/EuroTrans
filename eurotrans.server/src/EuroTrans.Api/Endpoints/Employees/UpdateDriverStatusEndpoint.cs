using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Employees.Drivers.UpdateDriverStatus;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Employees;

public static class UpdateDriverStatusEndpoint
{
    public static void MapUpdateDriverStatusEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPut("/api/drivers/{id}/status", async (
            Guid id,
            UpdateDriverStatusRequest request,
            [FromServices] UpdateDriverStatusService service,
            CancellationToken ct) =>
        {
            var result = await service.UpdateAsync(id, request.Status, ct);
            return result.Match(
                _ => Results.NoContent(),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("manager", "write:employees");
    }
}
