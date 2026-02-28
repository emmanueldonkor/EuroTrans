using System.Diagnostics;
using Microsoft.AspNetCore.Diagnostics;

namespace EuroTrans.Api;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> logger;
    private readonly IHostEnvironment environment;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IHostEnvironment environment)
    {
        this.logger = logger;
        this.environment = environment;
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
        var detail = environment.IsDevelopment()
            ? exception.Message
            : "Request failed due to an unexpected server error.";

        await Results.Problem(
           title: title,
           detail: detail,
           statusCode: statusCode,
           extensions: new Dictionary<string, object?>
           {
                { "traceId", traceId },
                { "correlationId", correlationId },
                { "exceptionType", exception.GetType().FullName }
           }
       ).ExecuteAsync(httpContext);
        return true;
    }

      private static (int statusCode, string Title) MapException(Exception exception)
    {
        return exception switch
        {
            ArgumentNullException => (StatusCodes.Status400BadRequest, exception.Message),
            _ => (StatusCodes.Status500InternalServerError, "We are very sorry, we are working on it to fix it immediately")
        };
    }
}
