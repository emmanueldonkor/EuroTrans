using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features;
using EuroTrans.Application.features.Shipments;
using EuroTrans.Application.features.Shipments.Tracking;
using EuroTrans.Domain.Shipments.Enums;
using EuroTrans.Test.TestData;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace EuroTrans.Test.Application;

public class TrackingHeartbeatServiceTests
{
    [Fact]
    public async Task AddAsync_ShouldReturnForbidden_WhenDriverIsNotAssigned()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var assignedDriverId = Guid.NewGuid();
        var anotherDriverId = Guid.NewGuid();
        var truckId = Guid.NewGuid();
        var now = new DateTime(2026, 2, 1, 12, 0, 0, DateTimeKind.Utc);

        var shipment = TestFactory.CreateDraftShipment();
        shipment.Assign(managerId, assignedDriverId, truckId, now).IsError.Should().BeFalse();
        shipment.Start(assignedDriverId, now.AddMinutes(5)).IsError.Should().BeFalse();

        var shipments = new Mock<IShipmentRepository>();
        shipments.Setup(x => x.GetForTrackingAsync(shipment.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(shipment);

        var currentEmployeeProvider = new Mock<ICurrentEmployeeProvider>();
        currentEmployeeProvider.Setup(x => x.GetEmployeeIdAsync())
            .ReturnsAsync(anotherDriverId);

        var uow = new Mock<IUnitOfWork>();

        var service = new TrackingHeartbeatService(
            logger: Mock.Of<ILogger<TrackingHeartbeatService>>(),
            shipments: shipments.Object,
            uow: uow.Object,
            currentEmployeeProvider: currentEmployeeProvider.Object,
            clock: Mock.Of<IDateTimeProvider>(x => x.UtcNow == now.AddMinutes(10)));

        // Act
        var result = await service.AddAsync(shipment.Id, new TrackingHeartbeatRequest(52.5, 13.4, "Berlin"));

        // Assert
        result.IsError.Should().BeTrue();
        result.FirstError.Type.Should().Be(ErrorType.Forbidden);
        shipment.Milestones.Should().BeEmpty();

        uow.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task AddAsync_ShouldAddLocationMilestone_WithoutNewActivity_WhenSuccessful()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var driverId = Guid.NewGuid();
        var truckId = Guid.NewGuid();
        var now = new DateTime(2026, 2, 1, 12, 0, 0, DateTimeKind.Utc);

        var shipment = TestFactory.CreateDraftShipment();
        shipment.Assign(managerId, driverId, truckId, now).IsError.Should().BeFalse();
        shipment.Start(driverId, now.AddMinutes(5)).IsError.Should().BeFalse();
        var activityCountBefore = shipment.Activities.Count;

        var shipments = new Mock<IShipmentRepository>();
        shipments.Setup(x => x.GetForTrackingAsync(shipment.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(shipment);

        var currentEmployeeProvider = new Mock<ICurrentEmployeeProvider>();
        currentEmployeeProvider.Setup(x => x.GetEmployeeIdAsync())
            .ReturnsAsync(driverId);

        var uow = new Mock<IUnitOfWork>();
        uow.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var service = new TrackingHeartbeatService(
            logger: Mock.Of<ILogger<TrackingHeartbeatService>>(),
            shipments: shipments.Object,
            uow: uow.Object,
            currentEmployeeProvider: currentEmployeeProvider.Object,
            clock: Mock.Of<IDateTimeProvider>(x => x.UtcNow == now.AddMinutes(10)));

        // Act
        var result = await service.AddAsync(
            shipment.Id,
            new TrackingHeartbeatRequest(52.5001, 13.4001, "  Berlin Mitte  "));

        // Assert
        result.IsError.Should().BeFalse();
        shipment.Status.Should().Be(ShipmentStatus.InTransit);
        shipment.Milestones.Should().ContainSingle();
        shipment.Milestones.First().Type.Should().Be(MilestoneType.LocationUpdate);
        shipment.Milestones.First().LocationLabel.Should().Be("Berlin Mitte");
        shipment.Activities.Count.Should().Be(activityCountBefore);

        uow.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
