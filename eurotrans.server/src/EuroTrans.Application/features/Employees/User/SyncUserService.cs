using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Domain.Employees;
using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Application.features.Employees.User;

public class SyncUserService
{
    private readonly IEmployeeRepository employees;
    private readonly IUnitOfWork uow;
    private readonly IDateTimeProvider clock;

    public SyncUserService(IEmployeeRepository employees, IUnitOfWork uow, IDateTimeProvider clock)
    {
        this.employees = employees;
        this.uow = uow;
        this.clock = clock;
    }

    public async Task<ErrorOr<Guid>> SyncAsync(SyncUserRequest request, CancellationToken ct = default)
    {
        var role = request.Role.ToLowerInvariant() switch
        {
            "driver" => EmployeeRole.Driver,
            "manager" => EmployeeRole.Manager,
            _ => EmployeeRole.Driver
        };

        var existing = await employees.GetByAuth0IdAsync(request.Auth0UserId, ct);
        if (existing != null)
        {
            var roleResult = existing.UpdateRole(role);
            if (roleResult.IsError)
                return roleResult.Errors;

            existing.UpdateFromIdentity(request.Name, request.Email);
            await uow.SaveChangesAsync(ct);
            return existing.Id;
        }

        var employeeId = Guid.NewGuid();

        var employee = new Employee(
            id: employeeId,
            auth0UserId: request.Auth0UserId,
            name: request.Name,
            email: request.Email,
            role: role,
            avatarUrl: null,
            createdAtUtc: clock.UtcNow
        );

        employee.UpdateRole(role);

        await employees.AddAsync(employee, ct);
        await uow.SaveChangesAsync(ct);

        return employeeId;
    }
}
