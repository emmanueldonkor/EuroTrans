using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Application.features.Employees.Drivers.GetDriver;

public record GetDriverResponse(
    Guid EmployeeId,
    string Name,
    string Email,
    string? AvatarUrl,
    bool IsActive,
    DateTime CreatedAtUtc,
    string LicenseNumber,
    DriverStatus Status
);
