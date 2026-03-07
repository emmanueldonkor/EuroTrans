using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Application.features.Employees.Drivers;

public record DriverOptionQueryItem(
    Guid EmployeeId,
    string Name,
    string? Phone,
    DriverStatus Status);
