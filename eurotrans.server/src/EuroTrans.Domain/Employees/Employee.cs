using EuroTrans.Domain.Common;
using EuroTrans.Domain.Common.Exceptions;
using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Domain.Employees;

public class Employee : AggregateRoot
{
    public string Auth0UserId { get; private set; }
    public string Name { get; private set; }
    public string Email { get; private set; }
    public EmployeeRole Role { get; private set; }
    public string? AvatarUrl { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }

    // navigation
    public Driver? Driver { get; private set; }

    // private Employee() { }

    public Employee(
        Guid id,
        string auth0UserId,
        string name,
        string email,
        EmployeeRole role,
        string? avatarUrl,
        DateTime createdAtUtc)
        : base(id)
    {
        Auth0UserId = auth0UserId;
        Name = name;
        Email = email;
        Role = role;
        AvatarUrl = avatarUrl;
        IsActive = true;
        CreatedAtUtc = createdAtUtc;
    }

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;

    public void SetDriver(Driver driver)
    {
        if (Role != EmployeeRole.Driver) throw new DomainException("Only employees with Driver role can have a driver profile.");
        Driver = driver;
    }
    public void UpdateFromIdentity(string name, string email)
    {
        Name = name;
        Email = email;
    }
}