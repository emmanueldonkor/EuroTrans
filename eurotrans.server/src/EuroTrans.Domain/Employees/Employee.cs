using ErrorOr;
using EuroTrans.Domain.Common;
using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Domain.Employees;

public class Employee : AggregateRoot
{
    private static readonly HashSet<string> SupportedLanguages = new(StringComparer.OrdinalIgnoreCase)
    {
        "en",
        "de",
        "fr"
    };

    public string Auth0UserId { get; private set; }
    public string Name { get; private set; }
    public string Email { get; private set; }
    public EmployeeRole Role { get; private set; }
    public string? AvatarUrl { get; private set; }
    public string PreferredLanguage { get; private set; }
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
        DateTime createdAtUtc,
        string preferredLanguage = "en")
        : base(id)
    {
        Auth0UserId = auth0UserId;
        Name = name;
        Email = email;
        Role = role;
        AvatarUrl = avatarUrl;
        var normalizedLanguage = NormalizeLanguage(preferredLanguage);
        PreferredLanguage = SupportedLanguages.Contains(normalizedLanguage)
            ? normalizedLanguage
            : "en";
        IsActive = true;
        CreatedAtUtc = createdAtUtc;
    }

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;

    public ErrorOr<Success> SetDriver(Driver driver)
    {
        if (Role != EmployeeRole.Driver)
            return Error.Validation(description: "Only employees with Driver role can have a driver profile.");

        Driver = driver;
        return Result.Success;
    }
    public void UpdateFromIdentity(string name, string email)
    {
        Name = name;
        Email = email;
    }

    public ErrorOr<Success> SetPreferredLanguage(string preferredLanguage)
    {
        if (string.IsNullOrWhiteSpace(preferredLanguage))
            return Error.Validation("Employee.PreferredLanguage",
                "Preferred language cannot be empty.");

        var normalized = NormalizeLanguage(preferredLanguage);
        if (!SupportedLanguages.Contains(normalized))
            return Error.Validation(
                "Employee.PreferredLanguage",
                "Unsupported preferred language.");

        PreferredLanguage = normalized;
        return Result.Success;
    }

    public ErrorOr<Success> UpdateRole(EmployeeRole role)
    {
        Role = role;

        if (role == EmployeeRole.Driver && Driver is null)
        {
            Driver = new Driver(Id, null, null);
        }

        if (role != EmployeeRole.Driver)
        {
            Driver = null;
        }

        return Result.Success;
    }

    private static string NormalizeLanguage(string languageCode)
    {
        return languageCode.Trim().ToLowerInvariant();
    }
}
