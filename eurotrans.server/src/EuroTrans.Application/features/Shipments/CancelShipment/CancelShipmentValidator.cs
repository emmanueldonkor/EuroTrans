namespace EuroTrans.Application.features.Shipments.CancelShipment;

using FluentValidation;

public class CancelShipmentValidator : AbstractValidator<Guid>
{
    public CancelShipmentValidator()
    {
        RuleFor(x => x)
            .NotEmpty().WithMessage("Shipment ID is required.");
    }
}
