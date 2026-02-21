using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Employees.Drivers.UpdateDriverProfile;
using FluentValidation;

namespace EuroTrans.Api.Endpoints.Employees;

[ApiEndpoint]
public static class UpdateDriverProfileEndpoint
{
    public static void MapUpdateDriverProfileEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPut("/api/drivers/me/profile", async (
            UpdateDriverProfileRequest request,
            UpdateDriverProfileService service,
            IValidator<UpdateDriverProfileRequest> validator,
            CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await service.UpdateAsync(request, ct);
            return result.Match(
                _ => Results.NoContent(),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("driver", "sync:users");
    }
}
