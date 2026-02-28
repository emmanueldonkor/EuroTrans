using System.Globalization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace EuroTrans.Api.Extensions;

public sealed class ApiRateLimitingOptions
{
    public const string SectionName = "RateLimiting";

    public int ReadPermitLimit { get; set; } = 180;
    public int WritePermitLimit { get; set; } = 60;
    public int TrackingPermitLimit { get; set; } = 240;
    public int ReadWindowSeconds { get; set; } = 60;
    public int WriteWindowSeconds { get; set; } = 60;
    public int TrackingWindowSeconds { get; set; } = 60;
    public int QueueLimit { get; set; } = 0;
}

public static class RateLimitingServiceCollectionExtensions
{
    public static IServiceCollection AddApiRateLimiting(this IServiceCollection services, IConfiguration configuration)
    {
        var options = configuration.GetSection(ApiRateLimitingOptions.SectionName).Get<ApiRateLimitingOptions>()
            ?? new ApiRateLimitingOptions();

        services.AddRateLimiter(rateLimiterOptions =>
        {
            rateLimiterOptions.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            rateLimiterOptions.OnRejected = async (context, token) =>
            {
                var httpContext = context.HttpContext;
                var logger = httpContext.RequestServices
                    .GetRequiredService<ILoggerFactory>()
                    .CreateLogger("EuroTrans.Api.RateLimiter");

                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                {
                    httpContext.Response.Headers.RetryAfter = Math.Ceiling(retryAfter.TotalSeconds)
                        .ToString(CultureInfo.InvariantCulture);
                }

                logger.LogWarning(
                    "Rate limit exceeded for {Method} {Path} from {RemoteIp}",
                    httpContext.Request.Method,
                    httpContext.Request.Path,
                    httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown");

                if (!httpContext.Response.HasStarted)
                {
                    var problem = new ProblemDetails
                    {
                        Title = "Too many requests",
                        Detail = "Rate limit exceeded. Please retry after a short delay.",
                        Status = StatusCodes.Status429TooManyRequests,
                    };

                    await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken: token);
                }
            };

            rateLimiterOptions.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
            {
                var path = httpContext.Request.Path.Value ?? string.Empty;

                if (path.StartsWith("/health", StringComparison.OrdinalIgnoreCase))
                    return RateLimitPartition.GetNoLimiter("health");

                var partitionKey = ResolvePartitionKey(httpContext);

                if (path.StartsWith("/api/shipments/", StringComparison.OrdinalIgnoreCase) &&
                    path.EndsWith("/tracking/heartbeat", StringComparison.OrdinalIgnoreCase))
                {
                    return RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: $"tracking:{partitionKey}",
                        factory: _ => BuildFixedWindowOptions(
                            permitLimit: options.TrackingPermitLimit,
                            windowSeconds: options.TrackingWindowSeconds,
                            queueLimit: options.QueueLimit));
                }

                if (IsWriteMethod(httpContext.Request.Method))
                {
                    return RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: $"write:{partitionKey}",
                        factory: _ => BuildFixedWindowOptions(
                            permitLimit: options.WritePermitLimit,
                            windowSeconds: options.WriteWindowSeconds,
                            queueLimit: options.QueueLimit));
                }

                return RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: $"read:{partitionKey}",
                    factory: _ => BuildFixedWindowOptions(
                        permitLimit: options.ReadPermitLimit,
                        windowSeconds: options.ReadWindowSeconds,
                        queueLimit: options.QueueLimit));
            });
        });

        return services;
    }

    private static FixedWindowRateLimiterOptions BuildFixedWindowOptions(
        int permitLimit,
        int windowSeconds,
        int queueLimit)
    {
        return new FixedWindowRateLimiterOptions
        {
            PermitLimit = permitLimit,
            Window = TimeSpan.FromSeconds(windowSeconds),
            QueueLimit = queueLimit,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            AutoReplenishment = true,
        };
    }

    private static string ResolvePartitionKey(HttpContext context)
    {
        var subject = context.User.FindFirst("sub")?.Value;
        if (!string.IsNullOrWhiteSpace(subject))
            return subject.Trim().ToLowerInvariant();

        return context.Connection.RemoteIpAddress?.ToString()?.Trim().ToLowerInvariant() ?? "unknown";
    }

    private static bool IsWriteMethod(string method)
    {
        return HttpMethods.IsPost(method)
            || HttpMethods.IsPut(method)
            || HttpMethods.IsPatch(method)
            || HttpMethods.IsDelete(method);
    }
}
