using EuroTrans.Infrastructure.Storage;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace EuroTrans.Api.HealthChecks;

public sealed class BlobStorageHealthCheck : IHealthCheck
{
    private readonly BlobContainerClientProvider containerProvider;
    private readonly SupabasePodService supabasePodService;

    public BlobStorageHealthCheck(
        BlobContainerClientProvider containerProvider,
        SupabasePodService supabasePodService)
    {
        this.containerProvider = containerProvider;
        this.supabasePodService = supabasePodService;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        if (supabasePodService.IsConfigured)
            return HealthCheckResult.Healthy("Supabase storage configured.");

        var container = containerProvider.TryGetClient();
        if (container is null)
            return HealthCheckResult.Degraded("Blob storage is not configured.");

        try
        {
            var exists = await container.ExistsAsync(cancellationToken);

            return exists.Value
                ? HealthCheckResult.Healthy("Blob container reachable.")
                : HealthCheckResult.Degraded("Blob container not found.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Degraded("Blob storage health check failed.", ex);
        }
    }
}
