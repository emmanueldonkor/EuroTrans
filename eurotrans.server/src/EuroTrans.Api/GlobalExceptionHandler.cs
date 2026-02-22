using System.Diagnostics;
using Microsoft.AspNetCore.Diagnostics;

namespace EuroTrans.Api;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        this.logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var traceId = Activity.Current?.Id ?? httpContext.TraceIdentifier;
        logger.LogError(
            exception,
            "Could not process a request on machine {MachineName}. TraceId: {TraceId}",
            Environment.MachineName, traceId);

        var (statusCode, title) = MapException(exception);

        await Results.Problem(
           title: title,
           detail: exception.Message,
           statusCode: statusCode,
           extensions: new Dictionary<string, object?>
           {
                { "traceId", traceId },
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
