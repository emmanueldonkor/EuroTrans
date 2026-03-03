using EuroTrans.Application.features.Employees.User;
using Microsoft.Extensions.Caching.Memory;

namespace EuroTrans.Api.Middlewares;

public class EnsureCurrentUserMiddleware
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

    private readonly RequestDelegate next;

    public EnsureCurrentUserMiddleware(RequestDelegate next)
    {
        this.next = next;
    }

    public async Task InvokeAsync(HttpContext context, IMemoryCache cache, EnsureCurrentUserService ensureCurrentUserService)
    {
        if (!ShouldRunFor(context))
        {
            await next(context);
            return;
        }

        var auth0UserId = context.User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(auth0UserId))
        {
            await next(context);
            return;
        }

        var cacheKey = $"ensure-current-user:{auth0UserId}";
        if (cache.TryGetValue(cacheKey, out _))
        {
            await next(context);
            return;
        }

        var ensureResult = await ensureCurrentUserService.EnsureAsync();
        if (ensureResult.IsError)
        {
            context.Response.StatusCode = ensureResult.FirstError.Type switch
            {
                ErrorOr.ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
                ErrorOr.ErrorType.Forbidden => StatusCodes.Status403Forbidden,
                ErrorOr.ErrorType.NotFound => StatusCodes.Status404NotFound,
                ErrorOr.ErrorType.Conflict => StatusCodes.Status409Conflict,
                _ => StatusCodes.Status400BadRequest,
            };

            await context.Response.WriteAsJsonAsync(new
            {
                title = "Failed to ensure current user",
                detail = string.Join("; ", ensureResult.Errors.Select(e => e.Description)),
            });
            return;
        }

        cache.Set(cacheKey, true, CacheDuration);
        await next(context);
    }

    private static bool ShouldRunFor(HttpContext context)
    {
        if (!context.User.Identity?.IsAuthenticated ?? true)
            return false;

        var path = context.Request.Path;
        if (!path.StartsWithSegments("/api"))
            return false;

        if (HttpMethods.IsGet(context.Request.Method) &&
            path.Equals("/api/auth/me", StringComparison.OrdinalIgnoreCase))
            return false;

        if (path.StartsWithSegments("/api/auth/sync-user"))
            return false;

        return true;
    }
}
