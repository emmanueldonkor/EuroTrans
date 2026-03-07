using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EuroTrans.Infrastructure.Storage;

public sealed class BlobContainerClientProvider
{
    private readonly ILogger<BlobContainerClientProvider> logger;
    private readonly string? connectionString;
    private readonly string? containerName;
    private BlobContainerClient? containerClient;

    public BlobContainerClientProvider(
        IConfiguration configuration,
        ILogger<BlobContainerClientProvider> logger)
    {
        this.logger = logger;
        connectionString = NormalizeConfigValue(configuration["AzureStorage:ConnectionString"]);
        containerName = NormalizeConfigValue(configuration["AzureStorage:Container"]);
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(connectionString) &&
        !string.IsNullOrWhiteSpace(containerName);

    public BlobContainerClient? TryGetClient()
    {
        if (!IsConfigured)
            return null;

        return containerClient ??= new BlobContainerClient(connectionString!, containerName!);
    }

    public async Task<BlobContainerClient> GetRequiredAsync(CancellationToken ct = default)
    {
        var client = TryGetClient();
        if (client is null)
            throw new InvalidOperationException(
                "Azure Blob Storage is not configured. Verify AzureStorage__ConnectionString and AzureStorage__Container app settings.");

        try
        {
            await client.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: ct);
            return client;
        }
        catch (RequestFailedException ex) when (ex.Status == 403)
        {
            throw new InvalidOperationException(
                "Azure Blob Storage authentication failed. Verify AzureStorage__ConnectionString and AzureStorage__Container app settings.",
                ex);
        }
        catch (RequestFailedException ex)
        {
            logger.LogWarning(
                ex,
                "Failed to prepare blob container {ContainerName}.",
                containerName);

            throw;
        }
    }

    private static string? NormalizeConfigValue(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        var trimmed = value.Trim().Replace("\r", string.Empty).Replace("\n", string.Empty);

        if ((trimmed.StartsWith('"') && trimmed.EndsWith('"')) ||
            (trimmed.StartsWith('\'') && trimmed.EndsWith('\'')))
        {
            trimmed = trimmed[1..^1];
        }

        return trimmed;
    }
}
