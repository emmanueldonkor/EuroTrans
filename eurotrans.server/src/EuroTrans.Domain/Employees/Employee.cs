using EuroTrans.Domain.Activities;
using EuroTrans.Domain.Drivers;
using EuroTrans.Domain.Enums;

namespace EuroTrans.Domain.Employees;

public class Employee
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public EmployeeRole Role { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation
    public Driver? Driver { get; set; }
    public ICollection<Activity> Activities { get; set; } = [];
}
