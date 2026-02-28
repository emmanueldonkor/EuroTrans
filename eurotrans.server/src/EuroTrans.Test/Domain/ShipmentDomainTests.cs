using ErrorOr;
using EuroTrans.Domain.Shipments.Enums;
using EuroTrans.Test.TestData;
using FluentAssertions;

namespace EuroTrans.Test.Domain;

public class ShipmentDomainTests
{
    [Fact]
    public void CreateDraft_ShouldInitializeAsUnassigned_AndAddCreatedActivity()
    {
        // Arrange
        var createdAt = new DateTime(2026, 1, 10, 8, 0, 0, DateTimeKind.Utc);

        // Act
        var shipment = TestFactory.CreateDraftShipment(createdAtUtc: createdAt);

        // Assert
        shipment.Status.Should().Be(ShipmentStatus.Unassigned);
        shipment.CreatedAtUtc.Should().Be(createdAt);
        shipment.Activities.Should().ContainSingle();
        shipment.Activities.First().Type.Should().Be(ActivityType.Created);
    }

    [Fact]
    public void Assign_ShouldReturnConflict_WhenShipmentIsNotUnassigned()
    {
        // Arrange
        var shipment = TestFactory.CreateDraftShipment();
        var managerId = Guid.NewGuid();
        var firstDriverId = Guid.NewGuid();
        var firstTruckId = Guid.NewGuid();
        var secondDriverId = Guid.NewGuid();
        var secondTruckId = Guid.NewGuid();
        var now = new DateTime(2026, 1, 10, 9, 0, 0, DateTimeKind.Utc);

        shipment.Assign(managerId, firstDriverId, firstTruckId, now).IsError.Should().BeFalse();

        // Act
        var result = shipment.Assign(managerId, secondDriverId, secondTruckId, now.AddMinutes(1));

        // Assert
        result.IsError.Should().BeTrue();
        result.FirstError.Type.Should().Be(ErrorType.Conflict);
    }

    [Fact]
    public void Start_ShouldReturnForbidden_WhenDriverIsNotAssignedDriver()
    {
        // Arrange
        var shipment = TestFactory.CreateDraftShipment();
        var managerId = Guid.NewGuid();
        var assignedDriverId = Guid.NewGuid();
        var anotherDriverId = Guid.NewGuid();
        var truckId = Guid.NewGuid();
        var now = new DateTime(2026, 1, 10, 10, 0, 0, DateTimeKind.Utc);

        shipment.Assign(managerId, assignedDriverId, truckId, now).IsError.Should().BeFalse();

        // Act
        var result = shipment.Start(anotherDriverId, now.AddMinutes(5));

        // Assert
        result.IsError.Should().BeTrue();
        result.FirstError.Type.Should().Be(ErrorType.Forbidden);
        shipment.Status.Should().Be(ShipmentStatus.Assigned);
    }

    [Fact]
    public void Deliver_ShouldSetStatus_AndAddProofOfDeliveryDocument()
    {
        // Arrange
        var shipment = TestFactory.CreateDraftShipment();
        var managerId = Guid.NewGuid();
        var driverId = Guid.NewGuid();
        var truckId = Guid.NewGuid();
        var now = new DateTime(2026, 1, 10, 11, 0, 0, DateTimeKind.Utc);
        var podUrl = "https://storage.example.com/pod/test.pdf";

        shipment.Assign(managerId, driverId, truckId, now).IsError.Should().BeFalse();
        shipment.Start(driverId, now.AddMinutes(10)).IsError.Should().BeFalse();

        // Act
        var result = shipment.Deliver(driverId, podUrl, now.AddMinutes(30));

        // Assert
        result.IsError.Should().BeFalse();
        shipment.Status.Should().Be(ShipmentStatus.Delivered);
        shipment.DeliveredAtUtc.Should().Be(now.AddMinutes(30));
        shipment.Documents.Should().ContainSingle(d => d.Url == podUrl);
        shipment.Activities.Should().Contain(a => a.Type == ActivityType.Delivered);
    }

    [Fact]
    public void Delete_ShouldReturnConflict_WhenShipmentAlreadyDelivered()
    {
        // Arrange
        var shipment = TestFactory.CreateDraftShipment();
        var managerId = Guid.NewGuid();
        var driverId = Guid.NewGuid();
        var truckId = Guid.NewGuid();
        var now = new DateTime(2026, 1, 10, 12, 0, 0, DateTimeKind.Utc);

        shipment.Assign(managerId, driverId, truckId, now).IsError.Should().BeFalse();
        shipment.Start(driverId, now.AddMinutes(10)).IsError.Should().BeFalse();
        shipment.Deliver(driverId, "https://storage.example.com/pod/test.pdf", now.AddMinutes(20)).IsError.Should().BeFalse();

        // Act
        var result = shipment.Delete(managerId, now.AddMinutes(30));

        // Assert
        result.IsError.Should().BeTrue();
        result.FirstError.Type.Should().Be(ErrorType.Conflict);
        shipment.Status.Should().Be(ShipmentStatus.Delivered);
    }
}
