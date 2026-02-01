namespace EuroTrans.Application.Common.Interfaces;

public interface IPodService
{
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType);
}
