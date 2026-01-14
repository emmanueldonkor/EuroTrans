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

    public async Task<Employee?> GetByIdAsync(Guid id)
    {
        return await db.Employees
            .Include(e => e.Driver)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<Employee?> GetByAuth0IdAsync(string auth0UserId)
    {
        return await db.Employees
            .Include(e => e.Driver)
            .FirstOrDefaultAsync(e => e.Auth0UserId == auth0UserId);
    }

    public async Task<List<Employee>> GetDriversAsync()
    {
        return await db.Employees
            .Include(e => e.Driver)
            .Where(e => e.Role == EmployeeRole.Driver)
            .ToListAsync();
    }

    public async Task AddAsync(Employee employee)
    {
        await db.Employees.AddAsync(employee);
    }

    public Task UpdateAsync(Employee employee)
    {
        db.Employees.Update(employee);
        return Task.CompletedTask;
    }
}
