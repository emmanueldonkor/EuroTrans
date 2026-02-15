using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Employees.Drivers.GetDriver;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Employees;

public static class GetDriverEndpoint
{
    public static void MapGetDriverEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/drivers/{id}", async (
            Guid id,
           [FromServices] GetDriverService service,
            CancellationToken ct,
            IValidator<Guid> validator) =>
        {
            var validation = await validator.ValidateAsync(id, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await service.GetAsync(id, ct);
            return result.Match(
                driver => Results.Ok(driver),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("manager", "read:employees"); ; 
    }
}
