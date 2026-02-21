using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;

namespace EuroTrans.Application.Common;

public class CurrentEmployeeProvider : ICurrentEmployeeProvider
{
    private readonly ICurrentUser currentUser;
    private readonly IEmployeeRepository employees;

    public CurrentEmployeeProvider(
        ICurrentUser currentUser,
        IEmployeeRepository employees)
    {
        this.currentUser = currentUser;
        this.employees = employees;
    }

    public async Task<ErrorOr<Guid>> GetEmployeeIdAsync()
    {
        if (string.IsNullOrWhiteSpace(currentUser.Auth0UserId))
        {
            return Error.Unauthorized(description: "User is not authenticated.");
        }

        var employee = await employees.GetByAuth0IdAsync(currentUser.Auth0UserId);
        if (employee is null)
        {
            return Error.Unauthorized(description: "User is not linked to an employee record.");
        }

        return employee.Id;
    }
}
