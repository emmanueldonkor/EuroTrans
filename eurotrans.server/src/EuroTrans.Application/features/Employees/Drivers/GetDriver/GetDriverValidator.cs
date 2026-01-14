namespace EuroTrans.Application.features.Employees.Drivers.GetDriver;

using FluentValidation;

public class GetDriverValidator : AbstractValidator<Guid>
{
    public GetDriverValidator()
    {
        RuleFor(x => x).NotEmpty().WithMessage("Driver ID is required.");
    }
}
