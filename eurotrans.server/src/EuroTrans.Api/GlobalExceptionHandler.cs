using System.Diagnostics;
using System.Net.Sockets;
using Azure;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Diagnostics;

namespace EuroTrans.Api;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> logger;
    private readonly IHostEnvironment environment;
    private readonly IConfiguration configuration;

    public GlobalExceptionHandler(
        ILogger<GlobalExceptionHandler> logger,
        IHostEnvironment environment,
        IConfiguration configuration)
    {
        this.logger = logger;
        this.environment = environment;
        this.configuration = configuration;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var correlationId = httpContext.Request.Headers["X-Correlation-ID"].ToString();
        if (string.IsNullOrWhiteSpace(correlationId))
            correlationId = httpContext.TraceIdentifier;

        var traceId = Activity.Current?.Id ?? httpContext.TraceIdentifier;
        var requestPath = httpContext.Request.Path;
        var method = httpContext.Request.Method;

        logger.LogError(
            exception,
            "Unhandled exception for {Method} {Path} on machine {MachineName}. TraceId: {TraceId}. CorrelationId: {CorrelationId}",
            method,
            requestPath,
            Environment.MachineName,
            traceId,
            correlationId);

        var (statusCode, title) = MapException(exception);
        var includeExceptionDetails =
            environment.IsDevelopment() ||
            configuration.GetValue<bool>("Diagnostics:ExposeExceptionDetails");

        var detail = includeExceptionDetails
            ? exception.GetBaseException().Message
            : "Request failed due to an unexpected server error.";

        var extensions = new Dictionary<string, object?>
        {
            { "traceId", traceId },
            { "correlationId", correlationId },
            { "exceptionType", exception.GetType().FullName },
            { "baseExceptionType", exception.GetBaseException().GetType().FullName }
        };

        if (includeExceptionDetails)
        {
            extensions["stackTrace"] = exception.StackTrace;
        }

        await Results.Problem(
           title: title,
           detail: detail,
           statusCode: statusCode,
           extensions: extensions
       ).ExecuteAsync(httpContext);
        return true;
    }

    private static (int statusCode, string Title) MapException(Exception exception)
    {
        return exception switch
        {
            ArgumentException => (StatusCodes.Status400BadRequest, "Invalid request."),
            FormatException => (StatusCodes.Status400BadRequest, "Invalid request payload."),
            KeyNotFoundException => (StatusCodes.Status404NotFound, "Requested resource was not found."),
            UnauthorizedAccessException => (StatusCodes.Status403Forbidden, "Access to the requested resource is forbidden."),
            DbUpdateConcurrencyException => (StatusCodes.Status409Conflict, "The resource was updated by another operation. Retry the request."),
            TimeoutException => (StatusCodes.Status503ServiceUnavailable, "A required dependency did not respond in time."),
            SocketException => (StatusCodes.Status503ServiceUnavailable, "A required dependency is currently unreachable."),
            RequestFailedException => (StatusCodes.Status503ServiceUnavailable, "A required external service is currently unavailable."),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected server error occurred.")
        };
    }
}
