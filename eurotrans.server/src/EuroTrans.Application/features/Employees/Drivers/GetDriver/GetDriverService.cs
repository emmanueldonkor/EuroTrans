using ErrorOr;
using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Application.features.Employees.Drivers.GetDriver;

public class GetDriverService
{
    private readonly IEmployeeRepository employees;

    public GetDriverService(IEmployeeRepository employees)
    {
        this.employees = employees;
    }

    public async Task<ErrorOr<GetDriverResponse>> GetAsync(Guid id)
    {
        var employee = await employees.GetByIdAsync(id);

        if (employee is null)
            return Error.NotFound(description: "Driver not found.");

        if (employee.Role != EmployeeRole.Driver)
            return Error.Validation(description: "Employee is not a driver.");

        if (employee.Driver == null)
            return Error.Unexpected(description: "Driver profile missing.");

        return new GetDriverResponse(
            EmployeeId: employee.Id,
            Name: employee.Name,
            Email: employee.Email,
            AvatarUrl: employee.AvatarUrl,
            IsActive: employee.IsActive,
            CreatedAtUtc: employee.CreatedAtUtc,
            LicenseNumber: employee.Driver.LicenseNumber!,
            Status: employee.Driver.Status
        );
    }
}
