using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Employees.User.GetCurrentUser;

namespace EuroTrans.Api.Endpoints.Employees;

[EuroTrans.Api.Endpoints.ApiEndpoint]
public static class GetCurrentUserEndpoint
{
    public static void MapGetCurrentUserEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/auth/me", async (
            GetCurrentUserService service,
            CancellationToken ct) =>
        {
            var result = await service.GetAsync(ct);
            return result.Match(
                user => Results.Ok(user),
                errors => errors.ToProblem());
        })
        .RequireAuthorization();
    }
}
