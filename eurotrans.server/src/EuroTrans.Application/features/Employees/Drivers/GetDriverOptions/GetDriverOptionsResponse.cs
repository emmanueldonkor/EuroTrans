using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Application.features.Employees.Drivers.GetDriverOptions;

public record GetDriverOptionsResponse(
    Guid EmployeeId,
    string Name,
    string? Phone,
    DriverStatus Status);
