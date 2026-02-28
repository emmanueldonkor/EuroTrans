using ErrorOr;
using EuroTrans.Domain.Trucks;
using EuroTrans.Test.TestData;
using FluentAssertions;

namespace EuroTrans.Test.Domain;

public class TruckDomainTests
{
    [Fact]
    public void SetStatus_ShouldReturnConflict_WhenSettingInUseManually()
    {
        // Arrange
        var truck = TestFactory.CreateTruck(TruckStatus.Available);

        // Act
        var result = truck.SetStatus(TruckStatus.InUse);

        // Assert
        result.IsError.Should().BeTrue();
        result.FirstError.Type.Should().Be(ErrorType.Conflict);
        truck.Status.Should().Be(TruckStatus.Available);
    }

    [Fact]
    public void Retire_ShouldReturnConflict_WhenTruckIsInUse()
    {
        // Arrange
        var truck = TestFactory.CreateTruck(TruckStatus.InUse);

        // Act
        var result = truck.Retire();

        // Assert
        result.IsError.Should().BeTrue();
        result.FirstError.Type.Should().Be(ErrorType.Conflict);
        truck.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Retire_ShouldDeactivateTruck_WhenTruckIsNotInUse()
    {
        // Arrange
        var truck = TestFactory.CreateTruck(TruckStatus.Available);

        // Act
        var result = truck.Retire();

        // Assert
        result.IsError.Should().BeFalse();
        truck.IsActive.Should().BeFalse();
    }
}
