using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Employees.User.UpdatePreferredLanguage;
using FluentValidation;

namespace EuroTrans.Api.Endpoints.Employees;

[ApiEndpoint]
public static class UpdatePreferredLanguageEndpoint
{
    public static void MapUpdatePreferredLanguageEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPut("/api/auth/me/language", async (
            UpdatePreferredLanguageRequest request,
            UpdatePreferredLanguageService service,
            IValidator<UpdatePreferredLanguageRequest> validator,
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
        .RequireAuthorization();
    }
}
