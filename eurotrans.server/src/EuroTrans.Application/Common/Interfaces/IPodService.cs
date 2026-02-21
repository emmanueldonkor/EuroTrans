namespace EuroTrans.Application.Common.Interfaces;

public interface IPodService
{
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType);
    Task DeleteAsync(string fileUrl, CancellationToken ct = default);
}
