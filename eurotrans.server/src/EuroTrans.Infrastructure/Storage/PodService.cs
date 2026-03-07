using Azure.Storage.Blobs.Models;
using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Infrastructure.Storage;

public class PodService : IPodService
{
    private readonly BlobContainerClientProvider containerProvider;

    public PodService(BlobContainerClientProvider containerProvider)
    {
        this.containerProvider = containerProvider;
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
    {
        var container = await containerProvider.GetRequiredAsync();
        var finalName = $"{Guid.NewGuid()}_{fileName}";
        var blobClient = container.GetBlobClient(finalName);

        await blobClient.UploadAsync(fileStream, new BlobHttpHeaders
        {
            ContentType = contentType
        });

        return blobClient.Uri.ToString();
    }

    public async Task DeleteAsync(string fileUrl, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(fileUrl))
            return;

        if (!Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri))
            return;

        var container = await containerProvider.GetRequiredAsync(ct);
        var blobPath = uri.AbsolutePath.TrimStart('/');
        var containerPrefix = $"{container.Name}/";
        if (blobPath.StartsWith(containerPrefix, StringComparison.OrdinalIgnoreCase))
            blobPath = blobPath[containerPrefix.Length..];

        if (string.IsNullOrWhiteSpace(blobPath))
            return;

        var blobClient = container.GetBlobClient(Uri.UnescapeDataString(blobPath));
        await blobClient.DeleteIfExistsAsync(cancellationToken: ct);
    }
}
