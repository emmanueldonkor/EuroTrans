using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Employees.Drivers.UpdateDriverStatus;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Employees;

[ApiEndpoint]
public static class UpdateDriverStatusEndpoint
{
    public static void MapUpdateDriverStatusEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPut("/api/drivers/{id}/status", async (
            Guid id,
            UpdateDriverStatusRequest request,
            [FromServices] UpdateDriverStatusService service,
            IValidator<UpdateDriverStatusRequest> validator,
            CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await service.UpdateAsync(id, request.Status, ct);
            return result.Match(
                _ => Results.NoContent(),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("manager", "write:employees");
    }
}
