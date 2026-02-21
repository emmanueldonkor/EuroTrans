using FluentValidation;

namespace EuroTrans.Application.features.Trucks.UpdateTruck;

public class UpdateTruckStatusValidator : AbstractValidator<UpdateTruckStatusRequest>
{
    public UpdateTruckStatusValidator()
    {
        RuleFor(x => x.Status).IsInEnum();
    }
}
