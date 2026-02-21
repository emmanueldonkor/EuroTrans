using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;
using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Application.features.Employees.User.GetCurrentUser;

public class GetCurrentUserService
{
    private readonly ICurrentUser currentUser;
    private readonly IEmployeeRepository employees;

    public GetCurrentUserService(
        ICurrentUser currentUser,
        IEmployeeRepository employees)
    {
        this.currentUser = currentUser;
        this.employees = employees;
    }

    public async Task<ErrorOr<GetCurrentUserResponse>> GetAsync(CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(currentUser.Auth0UserId))
            return Error.Unauthorized(description: "Authenticated user id is missing.");

        var employee = await employees.GetByAuth0IdAsync(currentUser.Auth0UserId, ct);
        if (employee is null)
            return Error.NotFound(description: "Current user is not linked to an employee.");

        var isDriver = employee.Role == EmployeeRole.Driver;
        var phone = employee.Driver?.Phone;
        var license = employee.Driver?.LicenseNumber;

        var driverProfileComplete = isDriver &&
            !string.IsNullOrWhiteSpace(phone) &&
            !string.IsNullOrWhiteSpace(license);

        return new GetCurrentUserResponse(
            EmployeeId: employee.Id,
            Name: employee.Name,
            Email: employee.Email,
            Role: employee.Role.ToString().ToLowerInvariant(),
            DriverProfileComplete: driverProfileComplete,
            Phone: phone,
            LicenseNumber: license
        );
    }
}
