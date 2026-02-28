using System.Collections.Concurrent;
using EuroTrans.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace EuroTrans.Infrastructure.Services;

public sealed class MemoryQueryCache : IQueryCache
{
    private readonly IMemoryCache cache;
    private readonly ConcurrentDictionary<string, long> versions = new(StringComparer.Ordinal);

    public MemoryQueryCache(IMemoryCache cache)
    {
        this.cache = cache;
    }

    public async Task<T> GetOrCreateAsync<T>(
        string key,
        TimeSpan ttl,
        Func<CancellationToken, Task<T>> factory,
        CancellationToken ct = default)
    {
        if (cache.TryGetValue(key, out T? cached) && cached is not null)
            return cached;

        var value = await factory(ct);
        cache.Set(key, value, ttl);
        return value;
    }

    public long GetVersion(string scope)
    {
        return versions.GetOrAdd(scope, 1);
    }

    public long BumpVersion(string scope)
    {
        return versions.AddOrUpdate(scope, 2, (_, current) => checked(current + 1));
    }
}
