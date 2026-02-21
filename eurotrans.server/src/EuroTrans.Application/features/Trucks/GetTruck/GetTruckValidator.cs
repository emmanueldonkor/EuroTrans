using FluentValidation;

namespace EuroTrans.Application.features.Trucks.GetTruck;

public class GetTruckValidator : AbstractValidator<GetTruckRequest>
{
    public GetTruckValidator()
    {
        RuleFor(x => x.TruckId)
            .NotEmpty()
            .WithMessage("Truck ID is required.");
    }
}
