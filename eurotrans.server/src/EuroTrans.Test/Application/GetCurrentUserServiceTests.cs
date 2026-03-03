using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features;
using EuroTrans.Application.features.Employees.User;
using EuroTrans.Application.features.Employees.User.GetCurrentUser;
using EuroTrans.Test.TestData;
using FluentAssertions;
using Moq;

namespace EuroTrans.Test.Application;

public class GetCurrentUserServiceTests
{
    [Fact]
    public async Task GetAsync_ShouldReturnUnauthorized_WhenAuth0UserIdIsMissing()
    {
        // Arrange
        var currentUser = new Mock<ICurrentUser>();
        currentUser.SetupGet(x => x.Auth0UserId).Returns(string.Empty);

        var employees = new Mock<IEmployeeRepository>();
        var ensureCurrentUserService = CreateEnsureCurrentUserService(currentUser, employees);
        var service = new GetCurrentUserService(currentUser.Object, employees.Object, ensureCurrentUserService);

        // Act
        var result = await service.GetAsync();

        // Assert
        result.IsError.Should().BeTrue();
        result.FirstError.Type.Should().Be(ErrorType.Unauthorized);
        employees.Verify(x => x.GetByAuth0IdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task GetAsync_ShouldReturnDriverProfileState_WhenEmployeeExists()
    {
        // Arrange
        const string auth0UserId = "auth0|driver-123";
        var employee = TestFactory.CreateDriverEmployee();

        var currentUser = new Mock<ICurrentUser>();
        currentUser.SetupGet(x => x.Auth0UserId).Returns(auth0UserId);

        var employees = new Mock<IEmployeeRepository>();
        employees.Setup(x => x.GetByAuth0IdAsync(auth0UserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employee);

        var ensureCurrentUserService = CreateEnsureCurrentUserService(currentUser, employees);
        var service = new GetCurrentUserService(currentUser.Object, employees.Object, ensureCurrentUserService);

        // Act
        var result = await service.GetAsync();

        // Assert
        result.IsError.Should().BeFalse();
        result.Value.EmployeeId.Should().Be(employee.Id);
        result.Value.Role.Should().Be("driver");
        result.Value.DriverProfileComplete.Should().BeTrue();
        result.Value.Phone.Should().NotBeNullOrWhiteSpace();
        result.Value.LicenseNumber.Should().NotBeNullOrWhiteSpace();
    }

    private static EnsureCurrentUserService CreateEnsureCurrentUserService(
        Mock<ICurrentUser> currentUser,
        Mock<IEmployeeRepository> employees)
    {
        var uow = new Mock<IUnitOfWork>();
        var clock = new Mock<IDateTimeProvider>();
        clock.SetupGet(x => x.UtcNow).Returns(DateTime.UtcNow);

        return new EnsureCurrentUserService(
            employees.Object,
            uow.Object,
            currentUser.Object,
            clock.Object);
    }
}
