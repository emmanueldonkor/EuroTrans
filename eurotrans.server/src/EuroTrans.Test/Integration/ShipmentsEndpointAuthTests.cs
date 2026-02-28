using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace EuroTrans.Test.Integration;

public class ShipmentsEndpointAuthTests : IClassFixture<ApiWebApplicationFactory>
{
    private readonly ApiWebApplicationFactory factory;

    public ShipmentsEndpointAuthTests(ApiWebApplicationFactory factory)
    {
        this.factory = factory;
    }

    [Fact]
    public async Task GetShipments_ShouldReturnUnauthorized_WhenNoAccessTokenProvided()
    {
        // Arrange
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("https://localhost"),
        });

        // Act
        var response = await client.GetAsync("/api/shipments?api-version=1.0");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
