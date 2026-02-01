using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using EuroTrans.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace EuroTrans.Infrastructure.Storage;

public class PodService : IPodService
{
    private readonly BlobContainerClient container;

    public PodService(IConfiguration config)
    {
        var connectionString = config["AzureStorage:ConnectionString"];
        var containerName = config["AzureStorage:Container"];

        container = new BlobContainerClient(connectionString, containerName);
        container.CreateIfNotExists(PublicAccessType.Blob);
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
    {
        var finalName = $"{Guid.NewGuid()}_{fileName}";
        var blobClient = container.GetBlobClient(finalName);

        await blobClient.UploadAsync(fileStream, new BlobHttpHeaders
        {
            ContentType = contentType
        });

        return blobClient.Uri.ToString();
    }
}
