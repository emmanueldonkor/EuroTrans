namespace EuroTrans.Api.Extensions;

public sealed class RequestLoggingOptions
{
    public const string SectionName = "RequestLogging";
    public int SlowRequestThresholdMs { get; set; } = 1000;
}

public static class LoggingServiceCollectionExtensions
{
    public static IServiceCollection AddApiLogging(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<RequestLoggingOptions>(
            configuration.GetSection(RequestLoggingOptions.SectionName));

        return services;
    }
}
