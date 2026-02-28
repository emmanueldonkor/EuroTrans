using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace EuroTrans.Test.Integration;

public class HealthEndpointTests : IClassFixture<ApiWebApplicationFactory>
{
    private readonly ApiWebApplicationFactory factory;

    public HealthEndpointTests(ApiWebApplicationFactory factory)
    {
        this.factory = factory;
    }

    [Fact]
    public async Task LiveHealthEndpoint_ShouldReturnOk()
    {
        // Arrange
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("https://localhost"),
        });

        // Act
        var response = await client.GetAsync("/health/live");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
