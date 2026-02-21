using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Application.features.Employees.Drivers.GetDrivers;

public record GetDriversResponse(
    Guid EmployeeId,
    string Name,
    string Email,
    string? Phone,
    DriverStatus Status,
    string? LicenseNumber
);
