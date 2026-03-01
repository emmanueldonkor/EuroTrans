using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Employees.Drivers.GetDrivers;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Employees;

[ApiEndpoint]
public static class GetDriversEndpoint
{
    public static void MapGetDriversEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/drivers", async (
            [AsParameters] GetDriversRequest request,
            [FromServices] GetDriversService service,
            IValidator<GetDriversRequest> validator,
            CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await service.GetAsync(request, ct);
            return result.Match(
                drivers => Results.Ok(drivers),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("manager", "read:employees");
    }
}
