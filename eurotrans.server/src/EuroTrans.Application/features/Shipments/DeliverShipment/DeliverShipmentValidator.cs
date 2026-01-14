namespace EuroTrans.Application.features.Shipments.DeliverShipment;

using FluentValidation;

public class DeliverShipmentValidator : AbstractValidator<DeliverShipmentRequest>
{
    public DeliverShipmentValidator()
    {
        RuleFor(x => x.ProofOfDeliveryUrl)
            .NotEmpty().WithMessage("Proof of delivery URL is required.");
    }
}
