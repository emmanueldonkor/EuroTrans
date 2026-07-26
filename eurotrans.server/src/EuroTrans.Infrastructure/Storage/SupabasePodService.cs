using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EuroTrans.Infrastructure.Storage;

public sealed class SupabasePodService
{
    private readonly IHttpClientFactory httpClientFactory;
    private readonly ILogger<SupabasePodService> logger;
    private readonly string? storageApiUrl;
    private readonly string? bucketName;
    private readonly string? serviceRoleKey;
    private readonly string? publicBaseUrl;

    public SupabasePodService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<SupabasePodService> logger)
    {
        this.httpClientFactory = httpClientFactory;
        this.logger = logger;

        storageApiUrl = NormalizeConfigValue(configuration["SupabaseStorage:Url"]);
        bucketName = NormalizeConfigValue(configuration["SupabaseStorage:Bucket"]);
        serviceRoleKey = NormalizeConfigValue(configuration["SupabaseStorage:ServiceRoleKey"]);
        publicBaseUrl = BuildPublicBaseUrl(
            NormalizeConfigValue(configuration["SupabaseStorage:PublicBaseUrl"]),
            storageApiUrl);
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(storageApiUrl) &&
        !string.IsNullOrWhiteSpace(bucketName) &&
        !string.IsNullOrWhiteSpace(serviceRoleKey) &&
        !string.IsNullOrWhiteSpace(publicBaseUrl);

    public bool CanHandleUrl(string fileUrl)
    {
        if (!IsConfigured || string.IsNullOrWhiteSpace(fileUrl))
            return false;

        return fileUrl.StartsWith(publicBaseUrl!, StringComparison.OrdinalIgnoreCase);
    }

    public async Task<string> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken ct = default)
    {
        EnsureConfigured();

        var client = httpClientFactory.CreateClient();
        var safeFileName = Path.GetFileName(fileName);
        var objectPath = $"{Guid.NewGuid()}_{safeFileName}";
        var escapedObjectPath = Uri.EscapeDataString(objectPath);
        var url = $"{storageApiUrl!.TrimEnd('/')}/object/{bucketName}/{escapedObjectPath}";

        using var request = new HttpRequestMessage(HttpMethod.Post, url);
        AddAuthenticationHeaders(request);
        request.Headers.Add("x-upsert", "false");

        var content = new StreamContent(fileStream);
        if (!string.IsNullOrWhiteSpace(contentType))
            content.Headers.ContentType = MediaTypeHeaderValue.Parse(contentType);

        request.Content = content;

        using var response = await client.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
        {
            var responseBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogError(
                "Supabase upload failed. StatusCode: {StatusCode}, Response: {ResponseBody}",
                response.StatusCode,
                responseBody);

            throw new InvalidOperationException("Supabase storage upload failed.");
        }

        return $"{publicBaseUrl!.TrimEnd('/')}/{bucketName}/{escapedObjectPath}";
    }

    public async Task DeleteAsync(string fileUrl, CancellationToken ct = default)
    {
        if (!IsConfigured || string.IsNullOrWhiteSpace(fileUrl))
            return;

        if (!TryExtractObjectPath(fileUrl, out var objectPath))
            return;

        var url = $"{storageApiUrl!.TrimEnd('/')}/object/{bucketName}";
        var client = httpClientFactory.CreateClient();

        using var request = new HttpRequestMessage(HttpMethod.Delete, url);
        AddAuthenticationHeaders(request);
        request.Content = JsonContent.Create(new { prefixes = new[] { objectPath } });

        using var response = await client.SendAsync(request, ct);
        if (response.StatusCode == HttpStatusCode.NotFound)
            return;

        if (!response.IsSuccessStatusCode)
        {
            var responseBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogWarning(
                "Supabase delete failed. StatusCode: {StatusCode}, Response: {ResponseBody}",
                response.StatusCode,
                responseBody);

            throw new InvalidOperationException("Supabase storage delete failed.");
        }
    }

    private void EnsureConfigured()
    {
        if (!IsConfigured)
        {
            throw new InvalidOperationException(
                "Supabase storage is not configured. Verify SupabaseStorage__Url, SupabaseStorage__Bucket, and SupabaseStorage__ServiceRoleKey.");
        }
    }

    private void AddAuthenticationHeaders(HttpRequestMessage request)
    {
        request.Headers.Add("apikey", serviceRoleKey);

        // New Supabase secret keys (sb_secret_...) must be sent using apikey only.
        // Legacy service_role keys are JWTs and still need the bearer header to bypass RLS.
        if (!serviceRoleKey!.StartsWith("sb_", StringComparison.OrdinalIgnoreCase))
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", serviceRoleKey);
    }

    private bool TryExtractObjectPath(string fileUrl, out string objectPath)
    {
        objectPath = string.Empty;

        if (!Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri))
            return false;

        var path = uri.AbsolutePath;
        var publicMarker = $"/object/public/{bucketName}/";
        var privateMarker = $"/object/{bucketName}/";

        var startIndex = path.IndexOf(publicMarker, StringComparison.OrdinalIgnoreCase);
        if (startIndex >= 0)
        {
            objectPath = Uri.UnescapeDataString(path[(startIndex + publicMarker.Length)..]);
            return !string.IsNullOrWhiteSpace(objectPath);
        }

        startIndex = path.IndexOf(privateMarker, StringComparison.OrdinalIgnoreCase);
        if (startIndex >= 0)
        {
            objectPath = Uri.UnescapeDataString(path[(startIndex + privateMarker.Length)..]);
            return !string.IsNullOrWhiteSpace(objectPath);
        }

        return false;
    }

    private static string? BuildPublicBaseUrl(string? configuredPublicBaseUrl, string? configuredStorageApiUrl)
    {
        if (!string.IsNullOrWhiteSpace(configuredPublicBaseUrl))
            return configuredPublicBaseUrl.TrimEnd('/');

        if (string.IsNullOrWhiteSpace(configuredStorageApiUrl))
            return null;

        var trimmed = configuredStorageApiUrl.TrimEnd('/');
        return $"{trimmed}/object/public";
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
