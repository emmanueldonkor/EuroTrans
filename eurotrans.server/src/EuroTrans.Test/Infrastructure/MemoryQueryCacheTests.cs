using EuroTrans.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Moq;

namespace EuroTrans.Test.Infrastructure;

public class MemoryQueryCacheTests
{
    [Fact]
    public async Task GetOrCreateAsync_ShouldReuseCachedValue_WhenKeyIsSame()
    {
        // Arrange
        using var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var cache = new MemoryQueryCache(
            logger: Mock.Of<ILogger<MemoryQueryCache>>(),
            cache: memoryCache);

        var factoryCalls = 0;

        // Act
        var first = await cache.GetOrCreateAsync(
            key: "shipments:test",
            ttl: TimeSpan.FromMinutes(1),
            factory: _ =>
            {
                factoryCalls++;
                return Task.FromResult("value-1");
            });

        var second = await cache.GetOrCreateAsync(
            key: "shipments:test",
            ttl: TimeSpan.FromMinutes(1),
            factory: _ =>
            {
                factoryCalls++;
                return Task.FromResult("value-2");
            });

        // Assert
        first.Should().Be("value-1");
        second.Should().Be("value-1");
        factoryCalls.Should().Be(1);
    }

    [Fact]
    public void Versioning_ShouldStartAtOne_AndIncrementWithBump()
    {
        // Arrange
        using var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var cache = new MemoryQueryCache(
            logger: Mock.Of<ILogger<MemoryQueryCache>>(),
            cache: memoryCache);

        // Act
        var initial = cache.GetVersion("shipments");
        var bumped = cache.BumpVersion("shipments");
        var afterBump = cache.GetVersion("shipments");

        // Assert
        initial.Should().Be(1);
        bumped.Should().Be(2);
        afterBump.Should().Be(2);
    }
}
