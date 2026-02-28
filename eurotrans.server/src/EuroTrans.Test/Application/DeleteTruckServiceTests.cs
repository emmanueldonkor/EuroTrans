using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features;
using EuroTrans.Application.features.Shipments;
using EuroTrans.Application.features.Trucks;
using EuroTrans.Application.features.Trucks.DeleteTruck;
using EuroTrans.Domain.Trucks;
using EuroTrans.Test.TestData;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace EuroTrans.Test.Application;

public class DeleteTruckServiceTests
{
    [Fact]
    public async Task DeleteAsync_ShouldReturnConflict_WhenTruckHasActiveAssignment()
    {
        // Arrange
        var truck = TestFactory.CreateTruck(TruckStatus.Available);

        var trucks = new Mock<ITruckRepository>();
        trucks.Setup(x => x.GetByIdAsync(truck.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(truck);

        var shipments = new Mock<IShipmentRepository>();
        shipments.Setup(x => x.HasActiveAssignmentForTruckAsync(truck.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var uow = new Mock<IUnitOfWork>();
        var cache = new Mock<IQueryCache>();

        var service = new DeleteTruckService(
            logger: Mock.Of<ILogger<DeleteTruckService>>(),
            trucks: trucks.Object,
            shipments: shipments.Object,
            uow: uow.Object,
            cache: cache.Object);

        // Act
        var result = await service.DeleteAsync(truck.Id);

        // Assert
        result.IsError.Should().BeTrue();
        result.FirstError.Type.Should().Be(ErrorType.Conflict);
        truck.IsActive.Should().BeTrue();

        trucks.Verify(x => x.UpdateAsync(It.IsAny<Truck>(), It.IsAny<CancellationToken>()), Times.Never);
        uow.Verify(x => x.SaveChangesWithConcurrencyCheckAsync(It.IsAny<CancellationToken>()), Times.Never);
        cache.Verify(x => x.BumpVersion(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_ShouldRetireTruck_AndBumpCache_WhenSuccessful()
    {
        // Arrange
        var truck = TestFactory.CreateTruck(TruckStatus.Available);

        var trucks = new Mock<ITruckRepository>();
        trucks.Setup(x => x.GetByIdAsync(truck.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(truck);
        trucks.Setup(x => x.UpdateAsync(truck, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var shipments = new Mock<IShipmentRepository>();
        shipments.Setup(x => x.HasActiveAssignmentForTruckAsync(truck.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var uow = new Mock<IUnitOfWork>();
        uow.Setup(x => x.SaveChangesWithConcurrencyCheckAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success);

        var cache = new Mock<IQueryCache>();

        var service = new DeleteTruckService(
            logger: Mock.Of<ILogger<DeleteTruckService>>(),
            trucks: trucks.Object,
            shipments: shipments.Object,
            uow: uow.Object,
            cache: cache.Object);

        // Act
        var result = await service.DeleteAsync(truck.Id);

        // Assert
        result.IsError.Should().BeFalse();
        truck.IsActive.Should().BeFalse();

        trucks.Verify(x => x.UpdateAsync(truck, It.IsAny<CancellationToken>()), Times.Once);
        uow.Verify(x => x.SaveChangesWithConcurrencyCheckAsync(It.IsAny<CancellationToken>()), Times.Once);
        cache.Verify(x => x.BumpVersion(QueryCacheScopes.Trucks), Times.Once);
    }
}
