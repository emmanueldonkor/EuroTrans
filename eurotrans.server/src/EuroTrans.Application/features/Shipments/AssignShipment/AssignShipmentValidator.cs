namespace EuroTrans.Application.features.Shipments.AssignShipment;

using FluentValidation;

public class AssignShipmentValidator : AbstractValidator<AssignShipmentRequest>
{
    public AssignShipmentValidator()
    {
        RuleFor(x => x.DriverId)
            .NotEmpty().WithMessage("DriverId is required.");

        RuleFor(x => x.TruckId)
            .NotEmpty().WithMessage("TruckId is required.");
    }
}
