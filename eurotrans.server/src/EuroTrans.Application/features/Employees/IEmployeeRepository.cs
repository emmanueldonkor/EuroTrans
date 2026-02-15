using EuroTrans.Domain.Employees;

namespace EuroTrans.Application.features.Employees;

public interface IEmployeeRepository
{
    Task<Employee?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Employee?> GetByAuth0IdAsync(string auth0UserId, CancellationToken ct = default);
    Task<List<Employee>> GetDriversAsync(CancellationToken ct = default);
    Task AddAsync(Employee employee, CancellationToken ct = default);
    Task UpdateAsync(Employee employee, CancellationToken ct = default);
}

