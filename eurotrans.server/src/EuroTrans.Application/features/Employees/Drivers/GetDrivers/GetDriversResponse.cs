using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Application.features.Employees.Drivers.GetDrivers;

public record GetDriversResponse(
    Guid EmployeeId,
    string Name,
    string Email,
    string? AvatarUrl,
    string? Phone,
    DriverStatus Status,
    string LicenseNumber,
    bool IsActive
);
