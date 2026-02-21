namespace EuroTrans.Application.features.Shipments.StartShipment;

using FluentValidation;

public class StartShipmentValidator : AbstractValidator<StartShipmentRequest>
{
    public StartShipmentValidator()
    {
        RuleFor(x => x.ShipmentId)
            .NotEmpty().WithMessage("Shipment ID is required.");
    }
}
