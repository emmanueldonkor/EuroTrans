using EuroTrans.Domain.Common.Exceptions;
using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Application.features.Employees.Drivers.GetDriver;

public class GetDriverService
{
    private readonly IEmployeeRepository employees;

    public GetDriverService(IEmployeeRepository employees)
    {
        this.employees = employees;
    }

    public async Task<GetDriverResponse> GetAsync(Guid id)
    {
        var employee = await employees.GetByIdAsync(id)
            ?? throw new DomainException("Driver not found.");

        if (employee.Role != EmployeeRole.Driver)
            throw new DomainException("Employee is not a driver.");

        if (employee.Driver == null)
            throw new DomainException("Driver profile missing.");

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
