using EuroTrans.Api.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace EuroTrans.Api.Extensions;

public static class HealthChecksServiceCollectionExtensions
{
    public static IServiceCollection AddApiHealthChecks(this IServiceCollection services)
    {
        services.AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy(), tags: new[] { "live" })
            .AddCheck<DatabaseHealthCheck>("database", failureStatus: HealthStatus.Unhealthy, tags: new[] { "ready" })
            .AddCheck<BlobStorageHealthCheck>("blob-storage", failureStatus: HealthStatus.Degraded, tags: new[] { "ready" });

        return services;
    }
}
