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
                return Results.BadRequest(validation.Errors);

            var result = await service.GetAsync(id, ct);
            return Results.Ok(result);
        })
        .RequireAuthorization("manager", "read:employees"); ; 
    }
}
