using EuroTrans.Domain.Common.Exceptions;
using EuroTrans.Domain.Employees;
using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Application.features.Employees.User;

public class SyncUserService
{
    private readonly IEmployeeRepository employees;
    private readonly IUnitOfWork uow;

    public SyncUserService(IEmployeeRepository employees, IUnitOfWork uow)
    {
        this.employees = employees;
        this.uow = uow;
    }

    public async Task<Guid> SyncAsync(SyncUserRequest request)
    {
        // Idempotent: if exists, just update identity info
        var existing = await employees.GetByAuth0IdAsync(request.Auth0UserId);
        if (existing != null)
        {
            existing.UpdateFromIdentity(request.Name, request.Email);
            await uow.SaveChangesAsync();
            return existing.Id;
        }

        var role = request.Role.ToLower() switch
        {
            "driver" => EmployeeRole.Driver,
            "manager" => EmployeeRole.Manager,
            _ => throw new DomainException($"Unsupported role '{request.Role}'.")
        };

        var employeeId = Guid.NewGuid();

        var employee = new Employee(
            id: employeeId,
            auth0UserId: request.Auth0UserId,
            name: request.Name,
            email: request.Email,
            role: role,
            avatarUrl: null,
            createdAtUtc: DateTime.UtcNow
        );

        if (role == EmployeeRole.Driver)
        {
            var driver = new Driver(employeeId, null, null);
            employee.SetDriver(driver);
        }

        await employees.AddAsync(employee);
        await uow.SaveChangesAsync();

        return employeeId;
    }
}
