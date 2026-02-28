namespace EuroTrans.Application.Common.Interfaces;

public interface IQueryCache
{
    Task<T> GetOrCreateAsync<T>(
        string key,
        TimeSpan ttl,
        Func<CancellationToken, Task<T>> factory,
        CancellationToken ct = default);

    long GetVersion(string scope);

    long BumpVersion(string scope);
}
