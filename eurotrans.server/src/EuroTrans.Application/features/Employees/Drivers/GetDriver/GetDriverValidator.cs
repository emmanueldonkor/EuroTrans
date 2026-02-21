namespace EuroTrans.Application.features.Employees.Drivers.GetDriver;

using FluentValidation;

public class GetDriverValidator : AbstractValidator<GetDriverRequest>
{
    public GetDriverValidator()
    {
        RuleFor(x => x.DriverId).NotEmpty().WithMessage("Driver ID is required.");
    }
}
