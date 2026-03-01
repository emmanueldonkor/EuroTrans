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
            .Where(e => e.Role == EmployeeRole.Driver && e.Driver != null)
            .ToListAsync(ct);
    }

    public async Task<(List<Employee> Items, int TotalCount)> GetDriversPagedAsync(
        string? search,
        DriverStatus? status,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var query = db.Employees
            .AsNoTracking()
            .Include(e => e.Driver)
            .Where(e => e.Role == EmployeeRole.Driver && e.Driver != null);

        if (status.HasValue)
        {
            query = query.Where(e => e.Driver!.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";

            query = query.Where(e =>
                EF.Functions.ILike(e.Name, pattern) ||
                EF.Functions.ILike(e.Email, pattern) ||
                (e.Driver != null && (
                    (e.Driver.Phone != null && EF.Functions.ILike(e.Driver.Phone, pattern)) ||
                    (e.Driver.LicenseNumber != null && EF.Functions.ILike(e.Driver.LicenseNumber, pattern))
                )));
        }

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderBy(e => e.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
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
