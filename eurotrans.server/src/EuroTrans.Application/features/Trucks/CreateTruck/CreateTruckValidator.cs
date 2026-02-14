using FluentValidation;

namespace EuroTrans.Application.features.Trucks.CreateTruck;

public class CreateTruckValidator : AbstractValidator<CreateTruckRequest>
{
    public CreateTruckValidator()
    {
        RuleFor(x => x.PlateNumber).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Model).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Capacity).GreaterThan(0);
        RuleFor(x => x.Status).NotEmpty();
    }
}
