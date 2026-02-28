using ErrorOr;
using EuroTrans.Domain.Employees;
using EuroTrans.Domain.Employees.Enums;
using FluentAssertions;

namespace EuroTrans.Test.Domain;

public class EmployeeDomainTests
{
    [Fact]
    public void Constructor_ShouldFallbackToEnglish_WhenLanguageIsUnsupported()
    {
        // Act
        var employee = new Employee(
            id: Guid.NewGuid(),
            auth0UserId: "auth0|example",
            name: "Manager",
            email: "manager@test.com",
            role: EmployeeRole.Manager,
            avatarUrl: null,
            createdAtUtc: DateTime.UtcNow,
            preferredLanguage: "es");

        // Assert
        employee.PreferredLanguage.Should().Be("en");
    }

    [Fact]
    public void SetPreferredLanguage_ShouldNormalizeSupportedLanguage()
    {
        // Arrange
        var employee = new Employee(
            id: Guid.NewGuid(),
            auth0UserId: "auth0|example",
            name: "Manager",
            email: "manager@test.com",
            role: EmployeeRole.Manager,
            avatarUrl: null,
            createdAtUtc: DateTime.UtcNow);

        // Act
        var result = employee.SetPreferredLanguage(" FR ");

        // Assert
        result.IsError.Should().BeFalse();
        employee.PreferredLanguage.Should().Be("fr");
    }

    [Fact]
    public void SetPreferredLanguage_ShouldReturnValidation_WhenUnsupported()
    {
        // Arrange
        var employee = new Employee(
            id: Guid.NewGuid(),
            auth0UserId: "auth0|example",
            name: "Manager",
            email: "manager@test.com",
            role: EmployeeRole.Manager,
            avatarUrl: null,
            createdAtUtc: DateTime.UtcNow);

        // Act
        var result = employee.SetPreferredLanguage("it");

        // Assert
        result.IsError.Should().BeTrue();
        result.FirstError.Type.Should().Be(ErrorType.Validation);
        employee.PreferredLanguage.Should().Be("en");
    }
}
