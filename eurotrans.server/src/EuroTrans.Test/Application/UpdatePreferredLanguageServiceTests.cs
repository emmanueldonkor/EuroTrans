using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Employees.User.UpdatePreferredLanguage;
using EuroTrans.Domain.Employees;
using EuroTrans.Domain.Employees.Enums;
using FluentAssertions;
using Moq;

namespace EuroTrans.Test.Application;

public class UpdatePreferredLanguageServiceTests
{
    [Fact]
    public async Task UpdateAsync_ShouldReturnNotFound_WhenUserIsNotLinkedToEmployee()
    {
        // Arrange
        const string auth0UserId = "auth0|manager-1";
        var currentUser = new Mock<ICurrentUser>();
        currentUser.SetupGet(x => x.Auth0UserId).Returns(auth0UserId);

        var employees = new Mock<IEmployeeRepository>();
        employees.Setup(x => x.GetByAuth0IdAsync(auth0UserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Employee?)null);

        var uow = new Mock<IUnitOfWork>();

        var service = new UpdatePreferredLanguageService(
            currentUser: currentUser.Object,
            employees: employees.Object,
            uow: uow.Object);

        // Act
        var result = await service.UpdateAsync(new UpdatePreferredLanguageRequest("fr"));

        // Assert
        result.IsError.Should().BeTrue();
        result.FirstError.Type.Should().Be(ErrorType.NotFound);
        uow.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_ShouldPersistLanguage_WhenRequestIsValid()
    {
        // Arrange
        const string auth0UserId = "auth0|manager-2";
        var employee = new Employee(
            id: Guid.NewGuid(),
            auth0UserId: auth0UserId,
            name: "Manager",
            email: "manager@test.com",
            role: EmployeeRole.Manager,
            avatarUrl: null,
            createdAtUtc: DateTime.UtcNow);

        var currentUser = new Mock<ICurrentUser>();
        currentUser.SetupGet(x => x.Auth0UserId).Returns(auth0UserId);

        var employees = new Mock<IEmployeeRepository>();
        employees.Setup(x => x.GetByAuth0IdAsync(auth0UserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employee);

        var uow = new Mock<IUnitOfWork>();
        uow.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var service = new UpdatePreferredLanguageService(
            currentUser: currentUser.Object,
            employees: employees.Object,
            uow: uow.Object);

        // Act
        var result = await service.UpdateAsync(new UpdatePreferredLanguageRequest("de"));

        // Assert
        result.IsError.Should().BeFalse();
        employee.PreferredLanguage.Should().Be("de");
        uow.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
