using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees;

namespace EuroTrans.Application.features.Employees.User.UpdatePreferredLanguage;

public class UpdatePreferredLanguageService
{
    private readonly ICurrentUser currentUser;
    private readonly IEmployeeRepository employees;
    private readonly IUnitOfWork uow;

    public UpdatePreferredLanguageService(
        ICurrentUser currentUser,
        IEmployeeRepository employees,
        IUnitOfWork uow)
    {
        this.currentUser = currentUser;
        this.employees = employees;
        this.uow = uow;
    }

    public async Task<ErrorOr<Success>> UpdateAsync(
        UpdatePreferredLanguageRequest request,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(currentUser.Auth0UserId))
            return Error.Unauthorized(description: "Authenticated user id is missing.");

        var employee = await employees.GetByAuth0IdAsync(currentUser.Auth0UserId, ct);
        if (employee is null)
            return Error.NotFound(description: "Current user is not linked to an employee.");

        var result = employee.SetPreferredLanguage(request.PreferredLanguage);
        if (result.IsError)
            return result.Errors;

        await uow.SaveChangesAsync(ct);
        return Result.Success;
    }
}
