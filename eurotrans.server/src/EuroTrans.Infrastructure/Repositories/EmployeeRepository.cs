using EuroTrans.Application.features.Employees;
using EuroTrans.Domain.Employees;
using EuroTrans.Domain.Employees.Enums;
using EuroTrans.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EuroTrans.Infrastructure.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly AppDbContext db;

    public EmployeeRepository(AppDbContext db)
    {
        this.db = db;
    }

    public async Task<Employee?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await db.Employees
            .Include(e => e.Driver)
            .FirstOrDefaultAsync(e => e.Id == id, ct);
    }

    public async Task<Employee?> GetByAuth0IdAsync(string auth0UserId, CancellationToken ct = default)
    {
        return await db.Employees
            .Include(e => e.Driver)
            .FirstOrDefaultAsync(e => e.Auth0UserId == auth0UserId, ct);
    }

    public async Task<List<Employee>> GetDriversAsync(CancellationToken ct = default)
    {
        return await db.Employees
            .Include(e => e.Driver)
            .Where(e => e.Role == EmployeeRole.Driver)
            .ToListAsync(ct);
    }

    public async Task AddAsync(Employee employee, CancellationToken ct = default)
    {
        await db.Employees.AddAsync(employee, ct);
    }

    public Task UpdateAsync(Employee employee, CancellationToken ct = default)
    {
        db.Employees.Update(employee);
        return Task.CompletedTask;
    }
}
