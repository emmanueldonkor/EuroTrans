using System.Diagnostics;
using System.Security.Claims;
using EuroTrans.Api.Extensions;
using Microsoft.Extensions.Options;

namespace EuroTrans.Api.Middlewares;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate next;
    private readonly ILogger<RequestLoggingMiddleware> logger;
    private readonly RequestLoggingOptions options;

    public RequestLoggingMiddleware(
        RequestDelegate next,
        ILogger<RequestLoggingMiddleware> logger,
        IOptions<RequestLoggingOptions> options)
    {
        this.next = next;
        this.logger = logger;
        this.options = options.Value;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var correlationId = ResolveCorrelationId(context);
        var traceId = Activity.Current?.Id ?? context.TraceIdentifier;
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? context.User.FindFirstValue("sub")
            ?? "anonymous";

        context.Response.Headers["X-Correlation-ID"] = correlationId;

        using var _ = logger.BeginScope(new Dictionary<string, object?>
        {
            ["CorrelationId"] = correlationId,
            ["TraceId"] = traceId,
            ["UserId"] = userId,
        });

        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            logger.LogError(
                ex,
                "Unhandled exception for {Method} {Path} after {ElapsedMs} ms",
                context.Request.Method,
                context.Request.Path,
                stopwatch.ElapsedMilliseconds);
            throw;
        }

        stopwatch.Stop();
        var endpoint = context.GetEndpoint()?.DisplayName ?? "unmatched";
        var message = "HTTP {Method} {Path} responded {StatusCode} in {ElapsedMs} ms. Endpoint: {Endpoint}";

        if (stopwatch.ElapsedMilliseconds >= options.SlowRequestThresholdMs)
        {
            logger.LogWarning(
                message,
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                stopwatch.ElapsedMilliseconds,
                endpoint);
            return;
        }

        logger.LogInformation(
            message,
            context.Request.Method,
            context.Request.Path,
            context.Response.StatusCode,
            stopwatch.ElapsedMilliseconds,
            endpoint);
    }

    private static string ResolveCorrelationId(HttpContext context)
    {
        if (context.Request.Headers.TryGetValue("X-Correlation-ID", out var headerValue) &&
            !string.IsNullOrWhiteSpace(headerValue))
        {
            return headerValue.ToString();
        }

        return context.TraceIdentifier;
    }
}
