using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Employees.User;
using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Application.features.Employees.User.GetCurrentUser;

public class GetCurrentUserService
{
    private readonly ICurrentUser currentUser;
    private readonly IEmployeeRepository employees;
    private readonly EnsureCurrentUserService ensureCurrentUserService;

    public GetCurrentUserService(
        ICurrentUser currentUser,
        IEmployeeRepository employees,
        EnsureCurrentUserService ensureCurrentUserService)
    {
        this.currentUser = currentUser;
        this.employees = employees;
        this.ensureCurrentUserService = ensureCurrentUserService;
    }

    public async Task<ErrorOr<GetCurrentUserResponse>> GetAsync(CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(currentUser.Auth0UserId))
            return Error.Unauthorized(description: "Authenticated user id is missing.");

        var employee = await employees.GetByAuth0IdAsync(currentUser.Auth0UserId, ct);
        if (employee is null)
        {
            var ensureResult = await ensureCurrentUserService.EnsureAsync(ct);
            if (ensureResult.IsError)
                return ensureResult.Errors;

            employee = await employees.GetByIdAsync(ensureResult.Value, ct);
            if (employee is null)
                return Error.NotFound(description: "Current user is not linked to an employee.");
        }
        else
        {
            var expectedRole = currentUser.IsManager
                ? EmployeeRole.Manager
                : currentUser.IsDriver
                    ? EmployeeRole.Driver
                    : (EmployeeRole?)null;

            var expectedName = string.IsNullOrWhiteSpace(currentUser.Name)
                ? currentUser.Email
                : currentUser.Name;

            var requiresRoleSync = expectedRole.HasValue && employee.Role != expectedRole.Value;
            var requiresIdentitySync = !string.IsNullOrWhiteSpace(currentUser.Email) &&
                (!string.Equals(employee.Name, expectedName, StringComparison.Ordinal) ||
                 !string.Equals(employee.Email, currentUser.Email, StringComparison.OrdinalIgnoreCase));

            if (requiresRoleSync || requiresIdentitySync)
            {
                var ensureResult = await ensureCurrentUserService.EnsureAsync(ct);
                if (ensureResult.IsError)
                    return ensureResult.Errors;

                employee = await employees.GetByIdAsync(ensureResult.Value, ct);
                if (employee is null)
                    return Error.NotFound(description: "Current user is not linked to an employee.");
            }
        }

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
            PreferredLanguage: employee.PreferredLanguage,
            DriverProfileComplete: driverProfileComplete,
            Phone: phone,
            LicenseNumber: license
        );
    }
}
