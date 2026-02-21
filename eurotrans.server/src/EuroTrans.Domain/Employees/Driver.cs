using EuroTrans.Domain.Common;
using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Domain.Employees;

public class Driver : AggregateRoot
{
    public string? Phone { get; private set; }
    public string? LicenseNumber { get; private set; }
    public DriverStatus Status { get; private set; }
    public byte[] RowVersion { get; private set; } = [];

    // navigation
    public Employee Employee { get; private set; } = default!;

    private Driver() { }

    public Driver(Guid id, string? phone, string? licenseNumber)
    {
        Id = id; // PK = FK to Employee.Id
        Phone = phone;
        LicenseNumber = licenseNumber;
        Status = DriverStatus.Available;
    }

    public void SetAvailable() => Status = DriverStatus.Available;
    public void SetOnDuty() => Status = DriverStatus.OnDuty;
    public void SetOffDuty() => Status = DriverStatus.OffDuty;

    public void UpdateProfile(string? licenseNumber, string? phone)
    {
        LicenseNumber = licenseNumber;
        Phone = phone;
    }
    public void SetStatus(DriverStatus status) { Status = status; }
}
