using System.Collections.Concurrent;
using EuroTrans.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace EuroTrans.Infrastructure.Services;

public sealed class MemoryQueryCache : IQueryCache
{
    private readonly ILogger<MemoryQueryCache> logger;
    private readonly IMemoryCache cache;
    private readonly ConcurrentDictionary<string, long> versions = new(StringComparer.Ordinal);

    public MemoryQueryCache(ILogger<MemoryQueryCache> logger, IMemoryCache cache)
    {
        this.logger = logger;
        this.cache = cache;
    }

    public async Task<T> GetOrCreateAsync<T>(
        string key,
        TimeSpan ttl,
        Func<CancellationToken, Task<T>> factory,
        CancellationToken ct = default)
    {
        if (cache.TryGetValue(key, out T? cached) && cached is not null)
        {
            logger.LogDebug("Query cache hit. Key: {CacheKey}", key);
            return cached;
        }

        logger.LogDebug("Query cache miss. Key: {CacheKey}", key);

        var value = await factory(ct);
        cache.Set(key, value, ttl);
        logger.LogDebug("Query cache set. Key: {CacheKey}, TtlSeconds: {TtlSeconds}", key, ttl.TotalSeconds);
        return value;
    }

    public long GetVersion(string scope)
    {
        var version = versions.GetOrAdd(scope, 1);
        logger.LogDebug("Cache version read. Scope: {Scope}, Version: {Version}", scope, version);
        return version;
    }

    public long BumpVersion(string scope)
    {
        var newVersion = versions.AddOrUpdate(scope, 2, (_, current) => checked(current + 1));
        logger.LogInformation("Cache version bumped. Scope: {Scope}, NewVersion: {Version}", scope, newVersion);
        return newVersion;
    }
}
