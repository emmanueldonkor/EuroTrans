namespace EuroTrans.Application.features.Employees.User.GetCurrentUser;

public record GetCurrentUserResponse(
    Guid EmployeeId,
    string Name,
    string Email,
    string Role,
    bool DriverProfileComplete,
    string? Phone,
    string? LicenseNumber
);
