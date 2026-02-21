using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Employees.Drivers.GetDriver;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Employees;

[ApiEndpoint]
public static class GetDriverEndpoint
{
    public static void MapGetDriverEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/drivers/{id}", async (
            Guid id,
           [FromServices] GetDriverService service,
            CancellationToken ct,
            IValidator<GetDriverRequest> validator) =>
        {
            var request = new GetDriverRequest(id);
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await service.GetAsync(request.DriverId, ct);
            return result.Match(
                driver => Results.Ok(driver),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("manager", "read:employees");
    }
}
