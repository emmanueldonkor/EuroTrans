using FluentValidation;

namespace EuroTrans.Application.features.Employees.Drivers.UpdateDriverProfile;

public class UpdateDriverProfileValidator : AbstractValidator<UpdateDriverProfileRequest>
{
    public UpdateDriverProfileValidator()
    {
        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone is required.")
            .MaximumLength(32).WithMessage("Phone must be at most 32 characters.");

        RuleFor(x => x.LicenseNumber)
            .NotEmpty().WithMessage("License number is required.")
            .MaximumLength(64).WithMessage("License number must be at most 64 characters.");
    }
}
