using EuroTrans.Domain.Employees;
using EuroTrans.Domain.Employees.Enums;
using EuroTrans.Domain.Shipments;
using EuroTrans.Domain.Shipments.ValueObjects;
using EuroTrans.Domain.Trucks;

namespace EuroTrans.Test.TestData;

internal static class TestFactory
{
    public static Shipment CreateDraftShipment(
        Guid? shipmentId = null,
        string trackingId = "ET-TEST-0001",
        DateTime? createdAtUtc = null,
        Guid? managerId = null)
    {
        var timestamp = createdAtUtc ?? new DateTime(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);

        return Shipment.CreateDraft(
            id: shipmentId ?? Guid.NewGuid(),
            trackingId: trackingId,
            cargo: new Cargo("Electronics", 1200, 8),
            originAddress: new Address("Origin Street", "Berlin", "Germany", "10115"),
            originLocation: new GeoLocation(52.520008f, 13.404954f),
            destinationAddress: new Address("Destination Street", "Paris", "France", "75001"),
            destinationLocation: new GeoLocation(48.856613f, 2.352222f),
            createdAtUtc: timestamp,
            estimatedDeliveryDateUtc: timestamp.AddDays(2),
            managerId: managerId ?? Guid.NewGuid(),
            timestampUtc: timestamp);
    }

    public static Employee CreateDriverEmployee(Guid? employeeId = null, DriverStatus status = DriverStatus.Available)
    {
        var employee = new Employee(
            id: employeeId ?? Guid.NewGuid(),
            auth0UserId: $"auth0|{Guid.NewGuid()}",
            name: "Test Driver",
            email: "driver@test.com",
            role: EmployeeRole.Driver,
            avatarUrl: null,
            createdAtUtc: new DateTime(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc));

        var driver = new Driver(employee.Id, "123456789", "DL-12345");
        driver.SetStatus(status);
        employee.SetDriver(driver);

        return employee;
    }

    public static Truck CreateTruck(TruckStatus status = TruckStatus.Available)
    {
        return new Truck(
            id: Guid.NewGuid(),
            plateNumber: "B-TR-1234",
            model: "Mercedes Actros",
            capacity: 18000,
            createdAtUtc: new DateTime(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc),
            status: status);
    }
}
