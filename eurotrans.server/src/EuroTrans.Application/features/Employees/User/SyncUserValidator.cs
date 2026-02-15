using FluentValidation;

namespace EuroTrans.Application.features.Employees.User;
public class SyncUserValidator : AbstractValidator<SyncUserRequest>
{
    public SyncUserValidator()
    {
        RuleFor(x => x.Auth0UserId).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Role)
            .NotEmpty()
            .Must(r => r.Equals("driver", StringComparison.OrdinalIgnoreCase) || r.Equals("manager", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Role must be either 'driver' or 'manager'.");
    }
}