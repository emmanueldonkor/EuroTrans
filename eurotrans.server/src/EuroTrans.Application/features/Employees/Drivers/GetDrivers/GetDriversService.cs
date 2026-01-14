namespace EuroTrans.Application.features.Employees.Drivers.GetDrivers;

public class GetDriversService
{
    private readonly IEmployeeRepository employees;

    public GetDriversService(IEmployeeRepository employees)
    {
        this.employees = employees;
    }

    public async Task<List<GetDriversResponse>> GetAsync()
    {
        var drivers = await employees.GetDriversAsync();

        return drivers.Select(e => new GetDriversResponse(
            EmployeeId: e.Id,
            Name: e.Name,
            Email: e.Email,
            AvatarUrl: e.AvatarUrl,
            Status: e.Driver!.Status,
            LicenseNumber: e.Driver!.LicenseNumber,
            IsActive: e.IsActive
        )).ToList();
    }
}
