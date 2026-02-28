using Azure.Storage.Blobs;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace EuroTrans.Api.HealthChecks;

public sealed class BlobStorageHealthCheck : IHealthCheck
{
    private readonly BlobContainerClient container;

    public BlobStorageHealthCheck(BlobContainerClient container)
    {
        this.container = container;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var exists = await container.ExistsAsync(cancellationToken);

            return exists.Value
                ? HealthCheckResult.Healthy("Blob container reachable.")
                : HealthCheckResult.Unhealthy("Blob container not found.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Blob storage health check failed.", ex);
        }
    }
}
