using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;
using Microsoft.Extensions.Caching.Memory;

namespace EuroTrans.Application.Common;

public class CurrentEmployeeProvider : ICurrentEmployeeProvider
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

    private readonly ICurrentUser currentUser;
    private readonly IEmployeeRepository employees;
    private readonly IMemoryCache cache;

    public CurrentEmployeeProvider(
        ICurrentUser currentUser,
        IEmployeeRepository employees,
        IMemoryCache cache)
    {
        this.currentUser = currentUser;
        this.employees = employees;
        this.cache = cache;
    }

    public async Task<ErrorOr<Guid>> GetEmployeeIdAsync()
    {
        if (string.IsNullOrWhiteSpace(currentUser.Auth0UserId))
        {
            return Error.Unauthorized(description: "User is not authenticated.");
        }

        var cacheKey = $"employee-id:{currentUser.Auth0UserId}";
        if (cache.TryGetValue<Guid>(cacheKey, out var cached))
            return cached;

        var employee = await employees.GetByAuth0IdAsync(currentUser.Auth0UserId);
        if (employee is null)
        {
            return Error.Unauthorized(description: "User is not linked to an employee record.");
        }

        cache.Set(cacheKey, employee.Id, CacheDuration);
        return employee.Id;
    }
}
