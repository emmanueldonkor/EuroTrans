namespace EuroTrans.Application.features.Shipments.StartShipment;

using FluentValidation;

public class StartShipmentValidator : AbstractValidator<Guid>
{
    public StartShipmentValidator()
    {
        RuleFor(x => x)
            .NotEmpty().WithMessage("Shipment ID is required.");
    }
}
