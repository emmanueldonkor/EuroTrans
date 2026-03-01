using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Shipments;
using EuroTrans.Application.features.Shipments.Tracking;
using EuroTrans.Domain.Shipments.Enums;
using FluentAssertions;
using Moq;

namespace EuroTrans.Test.Application;

public class GetLivePinsServiceTests
{
    [Fact]
    public async Task GetAsync_ShouldFilterInvalidPins_AndMarkStalePins()
    {
        // Arrange
        var now = new DateTime(2026, 2, 1, 15, 0, 0, DateTimeKind.Utc);
        var shipmentA = Guid.NewGuid();
        var shipmentB = Guid.NewGuid();

        var items = new List<ShipmentLivePinQueryItem>
        {
            new(
                ShipmentId: shipmentA,
                TrackingId: "ET-A",
                DriverName: "Alice",
                CargoDescription: "Medical supplies",
                Status: ShipmentStatus.InTransit,
                Latitude: 52.5001,
                Longitude: 13.4001,
                LastLocationUpdatedAtUtc: now.AddMinutes(-2)),
            new(
                ShipmentId: shipmentB,
                TrackingId: "ET-B",
                DriverName: "  ",
                CargoDescription: " ",
                Status: ShipmentStatus.InTransit,
                Latitude: 48.8566,
                Longitude: 2.3522,
                LastLocationUpdatedAtUtc: now.AddMinutes(-8)),
            new(
                ShipmentId: Guid.NewGuid(),
                TrackingId: "ET-C",
                DriverName: "NoLat",
                CargoDescription: "Ignored",
                Status: ShipmentStatus.InTransit,
                Latitude: null,
                Longitude: 1,
                LastLocationUpdatedAtUtc: now.AddMinutes(-1)),
            new(
                ShipmentId: Guid.NewGuid(),
                TrackingId: "ET-D",
                DriverName: "NoTime",
                CargoDescription: "Ignored",
                Status: ShipmentStatus.InTransit,
                Latitude: 1,
                Longitude: 1,
                LastLocationUpdatedAtUtc: null),
        };

        var shipments = new Mock<IShipmentRepository>();
        shipments.Setup(x => x.GetLivePinItemsPagedAsync(1, 20, It.IsAny<CancellationToken>()))
            .ReturnsAsync((items, items.Count));

        var clock = new Mock<IDateTimeProvider>();
        clock.SetupGet(x => x.UtcNow).Returns(now);

        var service = new GetLivePinsService(shipments.Object, clock.Object);

        // Act
        var result = await service.GetAsync(new GetLivePinsRequest());

        // Assert
        result.Items.Should().HaveCount(2);
        result.Items[0].ShipmentId.Should().Be(shipmentA);
        result.Items[0].IsStale.Should().BeFalse();
        result.Items[1].ShipmentId.Should().Be(shipmentB);
        result.Items[1].DriverName.Should().Be("Unknown");
        result.Items[1].Cargo.Should().Be("Shipment cargo");
        result.Items[1].IsStale.Should().BeTrue();
        result.TotalCount.Should().Be(items.Count);
    }
}
