using EuroTrans.Application.features.Employees.Drivers.GetDriver;
using FluentValidation;

namespace EuroTrans.Api.Endpoints.Employees;

public static class GetDriverEndpoint
{
    public static void MapGetDriverEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/drivers/{id}", async (
            Guid id,
            GetDriverService service,
            IValidator<Guid> validator) =>
        {
            var validation = await validator.ValidateAsync(id);
            if (!validation.IsValid)
                return Results.BadRequest(validation.Errors);

            var result = await service.GetAsync(id);
            return Results.Ok(result);
        })
        .RequireAuthorization("manager"); 
    }
}
