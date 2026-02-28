using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Shipments;
using EuroTrans.Application.features.Shipments.AssignShipment;
using EuroTrans.Application.features.Trucks;
using EuroTrans.Domain.Employees.Enums;
using EuroTrans.Domain.Shipments.Enums;
using EuroTrans.Domain.Trucks;
using EuroTrans.Test.TestData;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace EuroTrans.Test.Application;

public class AssignShipmentServiceTests
{
    [Fact]
    public async Task AssignAsync_ShouldReturnConflict_WhenDriverIsUnavailable()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var shipment = TestFactory.CreateDraftShipment();
        var driver = TestFactory.CreateDriverEmployee(status: DriverStatus.OffDuty);
        var truck = TestFactory.CreateTruck(TruckStatus.Available);

        var shipments = new Mock<IShipmentRepository>();
        shipments.Setup(x => x.GetByIdAsync(shipment.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(shipment);

        var drivers = new Mock<IEmployeeRepository>();
        drivers.Setup(x => x.GetByIdAsync(driver.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(driver);

        var trucks = new Mock<ITruckRepository>();
        trucks.Setup(x => x.GetByIdAsync(truck.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(truck);

        var currentEmployeeProvider = new Mock<ICurrentEmployeeProvider>();
        currentEmployeeProvider.Setup(x => x.GetEmployeeIdAsync())
            .ReturnsAsync(managerId);

        var uow = new Mock<IUnitOfWork>();
        var cache = new Mock<IQueryCache>();

        var service = new AssignShipmentService(
            logger: Mock.Of<ILogger<AssignShipmentService>>(),
            shipments: shipments.Object,
            drivers: drivers.Object,
            trucks: trucks.Object,
            uow: uow.Object,
            currentEmployeeProvider: currentEmployeeProvider.Object,
            clock: Mock.Of<IDateTimeProvider>(x => x.UtcNow == new DateTime(2026, 2, 1, 8, 0, 0, DateTimeKind.Utc)),
            cache: cache.Object);

        // Act
        var result = await service.AssignAsync(shipment.Id, new AssignShipmentRequest(driver.Id, truck.Id));

        // Assert
        result.IsError.Should().BeTrue();
        result.FirstError.Type.Should().Be(ErrorType.Conflict);
        shipment.Status.Should().Be(ShipmentStatus.Unassigned);

        uow.Verify(x => x.SaveChangesWithConcurrencyCheckAsync(It.IsAny<CancellationToken>()), Times.Never);
        cache.Verify(x => x.BumpVersion(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task AssignAsync_ShouldAssignShipment_AndUpdateDriverAndTruck_WhenSuccessful()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var shipment = TestFactory.CreateDraftShipment();
        var driver = TestFactory.CreateDriverEmployee(status: DriverStatus.Available);
        var truck = TestFactory.CreateTruck(TruckStatus.Available);
        var now = new DateTime(2026, 2, 1, 8, 0, 0, DateTimeKind.Utc);

        var shipments = new Mock<IShipmentRepository>();
        shipments.Setup(x => x.GetByIdAsync(shipment.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(shipment);

        var drivers = new Mock<IEmployeeRepository>();
        drivers.Setup(x => x.GetByIdAsync(driver.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(driver);

        var trucks = new Mock<ITruckRepository>();
        trucks.Setup(x => x.GetByIdAsync(truck.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(truck);

        var currentEmployeeProvider = new Mock<ICurrentEmployeeProvider>();
        currentEmployeeProvider.Setup(x => x.GetEmployeeIdAsync())
            .ReturnsAsync(managerId);

        var uow = new Mock<IUnitOfWork>();
        uow.Setup(x => x.SaveChangesWithConcurrencyCheckAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success);

        var cache = new Mock<IQueryCache>();

        var service = new AssignShipmentService(
            logger: Mock.Of<ILogger<AssignShipmentService>>(),
            shipments: shipments.Object,
            drivers: drivers.Object,
            trucks: trucks.Object,
            uow: uow.Object,
            currentEmployeeProvider: currentEmployeeProvider.Object,
            clock: Mock.Of<IDateTimeProvider>(x => x.UtcNow == now),
            cache: cache.Object);

        // Act
        var result = await service.AssignAsync(shipment.Id, new AssignShipmentRequest(driver.Id, truck.Id));

        // Assert
        result.IsError.Should().BeFalse();
        shipment.Status.Should().Be(ShipmentStatus.Assigned);
        shipment.DriverId.Should().Be(driver.Id);
        shipment.TruckId.Should().Be(truck.Id);
        driver.Driver!.Status.Should().Be(DriverStatus.OnDuty);
        truck.Status.Should().Be(TruckStatus.InUse);

        uow.Verify(x => x.SaveChangesWithConcurrencyCheckAsync(It.IsAny<CancellationToken>()), Times.Once);
        cache.Verify(x => x.BumpVersion(QueryCacheScopes.Shipments), Times.Once);
        cache.Verify(x => x.BumpVersion(QueryCacheScopes.Drivers), Times.Once);
        cache.Verify(x => x.BumpVersion(QueryCacheScopes.Trucks), Times.Once);
    }
}
