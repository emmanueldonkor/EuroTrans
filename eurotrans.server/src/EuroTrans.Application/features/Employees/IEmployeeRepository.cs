using EuroTrans.Domain.Employees;

namespace EuroTrans.Application.features.Employees;

public interface IEmployeeRepository
{
    Task<Employee?> GetByIdAsync(Guid id);
    Task<Employee?> GetByAuth0IdAsync(string auth0UserId);
    Task<List<Employee>> GetDriversAsync();
    Task AddAsync(Employee employee);
    Task UpdateAsync(Employee employee);
}

