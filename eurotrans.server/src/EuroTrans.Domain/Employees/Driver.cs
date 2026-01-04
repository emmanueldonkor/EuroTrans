using EuroTrans.Domain.Common;
using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Domain.Employees;

public class Driver : AggregateRoot
{
    public Guid EmployeeId { get; private set; }
    public string Phone { get; private set; }
    public string LicenseNumber { get; private set; }
    public DriverStatus Status { get; private set; }

    // navigation
    public Employee Employee { get; private set; } = default!;

    //private Driver() { }

    public Driver(Guid employeeId, string phone, string licenseNumber)
    {
        Id = employeeId; // PK = FK
        EmployeeId = employeeId;
        Phone = phone;
        LicenseNumber = licenseNumber;
        Status = DriverStatus.Available;
    }

    public void SetAvailable() => Status = DriverStatus.Available;
    public void SetOnDuty() => Status = DriverStatus.OnDuty;
    public void SetOffDuty() => Status = DriverStatus.OffDuty;
}
