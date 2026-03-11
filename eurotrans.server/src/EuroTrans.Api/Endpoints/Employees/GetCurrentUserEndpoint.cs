using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees.User.GetCurrentUser;
using Microsoft.Extensions.Caching.Memory;

namespace EuroTrans.Api.Endpoints.Employees;

[ApiEndpoint]
public static class GetCurrentUserEndpoint
{
    public static void MapGetCurrentUserEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/auth/me", async (
            GetCurrentUserService service,
            ICurrentUser currentUser,
            IMemoryCache cache,
            CancellationToken ct) =>
        {
            var auth0UserId = currentUser.Auth0UserId;
            if (!string.IsNullOrWhiteSpace(auth0UserId))
            {
                var cacheKey = $"current-user:{auth0UserId}";
                if (cache.TryGetValue<GetCurrentUserResponse>(cacheKey, out var cached))
                    return Results.Ok(cached);
            }

            var result = await service.GetAsync(ct);
            return result.Match(
                user =>
                {
                    if (!string.IsNullOrWhiteSpace(auth0UserId))
                    {
                        cache.Set(
                            $"current-user:{auth0UserId}",
                            user,
                            TimeSpan.FromMinutes(2));
                    }

                    return Results.Ok(user);
                },
                errors => errors.ToProblem());
        })
        .RequireAuthorization();
    }
}
