using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Shipments;
using EuroTrans.Application.features.Shipments.DeliverShipment;
using EuroTrans.Application.features.Trucks;
using EuroTrans.Domain.Employees.Enums;
using EuroTrans.Domain.Shipments.Enums;
using EuroTrans.Domain.Trucks;
using EuroTrans.Test.TestData;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace EuroTrans.Test.Application;

public class DeliverShipmentServiceTests
{
    [Fact]
    public async Task DeliverAsync_ShouldReturnValidation_WhenShipmentIsNotInTransit()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var driverId = Guid.NewGuid();
        var shipment = TestFactory.CreateDraftShipment();
        var truckId = Guid.NewGuid();
        shipment.Assign(managerId, driverId, truckId, new DateTime(2026, 2, 1, 10, 0, 0, DateTimeKind.Utc)).IsError.Should().BeFalse();

        var service = CreateService(
            shipment,
            currentDriverId: driverId,
            saveResult: Result.Success,
            driverForRelease: null,
            truckForRelease: null,
            uploadUrl: "https://pod.example.com/one.pdf");

        using var stream = new MemoryStream([1, 2, 3]);

        // Act
        var result = await service.Service.DeliverAsync(
            shipmentId: shipment.Id,
            fileStream: stream,
            fileName: "pod.pdf",
            contentType: "application/pdf");

        // Assert
        result.IsError.Should().BeTrue();
        result.FirstError.Type.Should().Be(ErrorType.Validation);

        service.PodService.Verify(x => x.UploadAsync(It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        service.UnitOfWork.Verify(x => x.SaveChangesWithConcurrencyCheckAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task DeliverAsync_ShouldCleanupUploadedProof_WhenSaveFails()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var driverId = Guid.NewGuid();
        var shipment = TestFactory.CreateDraftShipment();
        var truck = TestFactory.CreateTruck(TruckStatus.InUse);
        var driver = TestFactory.CreateDriverEmployee(driverId, DriverStatus.OnDuty);
        var now = new DateTime(2026, 2, 1, 10, 0, 0, DateTimeKind.Utc);

        shipment.Assign(managerId, driverId, truck.Id, now).IsError.Should().BeFalse();
        shipment.Start(driverId, now.AddMinutes(10)).IsError.Should().BeFalse();

        var saveFailure = Error.Conflict("Db.Concurrency", "Concurrent update");
        var service = CreateService(
            shipment,
            currentDriverId: driverId,
            saveResult: saveFailure,
            driverForRelease: driver,
            truckForRelease: truck,
            uploadUrl: "https://pod.example.com/two.pdf");

        using var stream = new MemoryStream([1, 2, 3, 4]);

        // Act
        var result = await service.Service.DeliverAsync(
            shipmentId: shipment.Id,
            fileStream: stream,
            fileName: "pod.pdf",
            contentType: "application/pdf");

        // Assert
        result.IsError.Should().BeTrue();
        result.FirstError.Type.Should().Be(ErrorType.Conflict);

        service.PodService.Verify(x => x.DeleteAsync("https://pod.example.com/two.pdf", It.IsAny<CancellationToken>()), Times.Once);
        service.Cache.Verify(x => x.BumpVersion(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task DeliverAsync_ShouldReleaseDriverAndTruck_AndBumpCaches_WhenSuccessful()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var driverId = Guid.NewGuid();
        var shipment = TestFactory.CreateDraftShipment();
        var truck = TestFactory.CreateTruck(TruckStatus.InUse);
        var driver = TestFactory.CreateDriverEmployee(driverId, DriverStatus.OnDuty);
        var now = new DateTime(2026, 2, 1, 10, 0, 0, DateTimeKind.Utc);

        shipment.Assign(managerId, driverId, truck.Id, now).IsError.Should().BeFalse();
        shipment.Start(driverId, now.AddMinutes(10)).IsError.Should().BeFalse();

        var service = CreateService(
            shipment,
            currentDriverId: driverId,
            saveResult: Result.Success,
            driverForRelease: driver,
            truckForRelease: truck,
            uploadUrl: "https://pod.example.com/three.pdf");

        using var stream = new MemoryStream([9, 9, 9]);

        // Act
        var result = await service.Service.DeliverAsync(
            shipmentId: shipment.Id,
            fileStream: stream,
            fileName: "pod.pdf",
            contentType: "application/pdf");

        // Assert
        result.IsError.Should().BeFalse();
        shipment.Status.Should().Be(ShipmentStatus.Delivered);
        shipment.Documents.Should().ContainSingle(d => d.Url == "https://pod.example.com/three.pdf");
        driver.Driver!.Status.Should().Be(DriverStatus.Available);
        truck.Status.Should().Be(TruckStatus.Available);

        service.Cache.Verify(x => x.BumpVersion(QueryCacheScopes.Shipments), Times.Once);
        service.Cache.Verify(x => x.BumpVersion(QueryCacheScopes.Drivers), Times.Once);
        service.Cache.Verify(x => x.BumpVersion(QueryCacheScopes.Trucks), Times.Once);
    }

    private static DeliverServiceFixture CreateService(
        EuroTrans.Domain.Shipments.Shipment shipment,
        Guid currentDriverId,
        ErrorOr<Success> saveResult,
        EuroTrans.Domain.Employees.Employee? driverForRelease,
        Truck? truckForRelease,
        string uploadUrl)
    {
        var shipments = new Mock<IShipmentRepository>();
        shipments.Setup(x => x.GetByIdAsync(shipment.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(shipment);

        var employees = new Mock<IEmployeeRepository>();
        employees.Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(driverForRelease);

        var trucks = new Mock<ITruckRepository>();
        trucks.Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(truckForRelease);

        var uow = new Mock<IUnitOfWork>();
        uow.Setup(x => x.SaveChangesWithConcurrencyCheckAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(saveResult);

        var currentEmployeeProvider = new Mock<ICurrentEmployeeProvider>();
        currentEmployeeProvider.Setup(x => x.GetEmployeeIdAsync())
            .ReturnsAsync(currentDriverId);

        var pod = new Mock<IPodService>();
        pod.Setup(x => x.UploadAsync(It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(uploadUrl);
        pod.Setup(x => x.DeleteAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var cache = new Mock<IQueryCache>();

        var service = new DeliverShipmentService(
            logger: Mock.Of<ILogger<DeliverShipmentService>>(),
            shipments: shipments.Object,
            drivers: employees.Object,
            trucks: trucks.Object,
            uow: uow.Object,
            currentEmployeeProvider: currentEmployeeProvider.Object,
            clock: Mock.Of<IDateTimeProvider>(x => x.UtcNow == new DateTime(2026, 2, 1, 11, 0, 0, DateTimeKind.Utc)),
            podService: pod.Object,
            cache: cache.Object);

        return new DeliverServiceFixture(service, uow, pod, cache);
    }

    private sealed record DeliverServiceFixture(
        DeliverShipmentService Service,
        Mock<IUnitOfWork> UnitOfWork,
        Mock<IPodService> PodService,
        Mock<IQueryCache> Cache);
}
