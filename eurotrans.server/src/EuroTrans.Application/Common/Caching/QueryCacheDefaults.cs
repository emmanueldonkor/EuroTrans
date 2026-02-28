namespace EuroTrans.Application.Common.Caching;

public static class QueryCacheScopes
{
    public const string Shipments = "shipments";
    public const string Drivers = "drivers";
    public const string Trucks = "trucks";
}

public static class QueryCacheTtls
{
    public static readonly TimeSpan Shipments = TimeSpan.FromSeconds(60);
    public static readonly TimeSpan ShipmentsDetails = TimeSpan.FromSeconds(30);
    public static readonly TimeSpan Drivers = TimeSpan.FromSeconds(60);
    public static readonly TimeSpan Trucks = TimeSpan.FromSeconds(60);
}

public static class QueryCacheKey
{
    public static string Segment(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return "_";

        return Uri.EscapeDataString(value.Trim().ToLowerInvariant());
    }
}
