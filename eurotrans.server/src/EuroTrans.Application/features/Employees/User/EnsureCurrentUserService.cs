using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Domain.Employees;
using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Application.features.Employees.User;

public class EnsureCurrentUserService
{
    private readonly IEmployeeRepository employees;
    private readonly IUnitOfWork uow;
    private readonly ICurrentUser currentUser;
    private readonly IDateTimeProvider clock;

    public EnsureCurrentUserService(
        IEmployeeRepository employees,
        IUnitOfWork uow,
        ICurrentUser currentUser,
        IDateTimeProvider clock)
    {
        this.employees = employees;
        this.uow = uow;
        this.currentUser = currentUser;
        this.clock = clock;
    }

    public async Task<ErrorOr<Guid>> EnsureAsync(CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(currentUser.Auth0UserId))
            return Error.Unauthorized(description: "Authenticated user id is missing.");

        if (string.IsNullOrWhiteSpace(currentUser.Email))
            return Error.Validation(description: "Authenticated user email claim is missing.");

        var resolvedName = string.IsNullOrWhiteSpace(currentUser.Name)
            ? currentUser.Email
            : currentUser.Name;

        var role = currentUser.IsManager
            ? EmployeeRole.Manager
            : currentUser.IsDriver
                ? EmployeeRole.Driver
                : (EmployeeRole?)null;

        var existing = await employees.GetByAuth0IdAsync(currentUser.Auth0UserId, ct);
        if (existing is not null)
        {
            var roleChanged = role.HasValue && existing.Role != role.Value;
            var identityChanged =
                !string.Equals(existing.Name, resolvedName, StringComparison.Ordinal) ||
                !string.Equals(existing.Email, currentUser.Email, StringComparison.OrdinalIgnoreCase);

            if (roleChanged && role is { } expectedRole)
            {
                var roleResult = existing.UpdateRole(expectedRole);
                if (roleResult.IsError)
                    return roleResult.Errors;
            }

            if (identityChanged)
            {
                existing.UpdateFromIdentity(resolvedName, currentUser.Email);
            }

            if (roleChanged || identityChanged)
            {
                await uow.SaveChangesAsync(ct);
            }

            return existing.Id;
        }

        if (role is null)
            return Error.Forbidden(description: "Current user has no supported role.");

        var employeeId = Guid.NewGuid();

        var employee = new Employee(
            id: employeeId,
            auth0UserId: currentUser.Auth0UserId,
            name: resolvedName,
            email: currentUser.Email,
            role: role.Value,
            avatarUrl: null,
            createdAtUtc: clock.UtcNow
        );

        employee.UpdateRole(role.Value);

        await employees.AddAsync(employee, ct);
        await uow.SaveChangesAsync(ct);

        return employeeId;
    }
}
