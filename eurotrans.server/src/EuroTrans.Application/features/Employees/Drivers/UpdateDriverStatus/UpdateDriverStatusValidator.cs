using FluentValidation;

namespace EuroTrans.Application.features.Employees.Drivers.UpdateDriverStatus;

public class UpdateDriverStatusValidator : AbstractValidator<UpdateDriverStatusRequest>
{
    public UpdateDriverStatusValidator()
    {
        RuleFor(x => x.Status).IsInEnum();
    }
}
