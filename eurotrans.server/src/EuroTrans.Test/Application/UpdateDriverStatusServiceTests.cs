using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Employees.Drivers.UpdateDriverStatus;
using EuroTrans.Application.features.Shipments;
using EuroTrans.Domain.Employees.Enums;
using EuroTrans.Test.TestData;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace EuroTrans.Test.Application;

public class UpdateDriverStatusServiceTests
{
    [Fact]
    public async Task UpdateAsync_ShouldReturnConflict_WhenDriverHasActiveAssignment()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
        var employee = TestFactory.CreateDriverEmployee(employeeId);

        var employees = new Mock<IEmployeeRepository>();
        employees.Setup(x => x.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employee);

        var shipments = new Mock<IShipmentRepository>();
        shipments.Setup(x => x.HasActiveAssignmentForDriverAsync(employeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var uow = new Mock<IUnitOfWork>();
        var cache = new Mock<IQueryCache>();

        var service = new UpdateDriverStatusService(
            logger: Mock.Of<ILogger<UpdateDriverStatusService>>(),
            employees: employees.Object,
            shipments: shipments.Object,
            uow: uow.Object,
            cache: cache.Object);

        // Act
        var result = await service.UpdateAsync(employeeId, DriverStatus.OffDuty);

        // Assert
        result.IsError.Should().BeTrue();
        result.FirstError.Type.Should().Be(ErrorType.Conflict);

        uow.Verify(x => x.SaveChangesWithConcurrencyCheckAsync(It.IsAny<CancellationToken>()), Times.Never);
        cache.Verify(x => x.BumpVersion(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateStatus_AndBumpCacheVersions_WhenSuccessful()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
        var employee = TestFactory.CreateDriverEmployee(employeeId);

        var employees = new Mock<IEmployeeRepository>();
        employees.Setup(x => x.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employee);
        employees.Setup(x => x.UpdateAsync(employee, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var shipments = new Mock<IShipmentRepository>();
        shipments.Setup(x => x.HasActiveAssignmentForDriverAsync(employeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var uow = new Mock<IUnitOfWork>();
        uow.Setup(x => x.SaveChangesWithConcurrencyCheckAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success);

        var cache = new Mock<IQueryCache>();
        cache.Setup(x => x.BumpVersion(It.IsAny<string>())).Returns(2);

        var service = new UpdateDriverStatusService(
            logger: Mock.Of<ILogger<UpdateDriverStatusService>>(),
            employees: employees.Object,
            shipments: shipments.Object,
            uow: uow.Object,
            cache: cache.Object);

        // Act
        var result = await service.UpdateAsync(employeeId, DriverStatus.OffDuty);

        // Assert
        result.IsError.Should().BeFalse();
        employee.Driver.Should().NotBeNull();
        employee.Driver!.Status.Should().Be(DriverStatus.OffDuty);

        employees.Verify(x => x.UpdateAsync(employee, It.IsAny<CancellationToken>()), Times.Once);
        uow.Verify(x => x.SaveChangesWithConcurrencyCheckAsync(It.IsAny<CancellationToken>()), Times.Once);
        cache.Verify(x => x.BumpVersion(QueryCacheScopes.Drivers), Times.Once);
        cache.Verify(x => x.BumpVersion(QueryCacheScopes.Shipments), Times.Once);
    }
}
