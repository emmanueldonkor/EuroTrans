namespace EuroTrans.Application.features.Shipments.DeleteShipment;

using FluentValidation;

public class DeleteShipmentValidator : AbstractValidator<DeleteShipmentRequest>
{
    public DeleteShipmentValidator()
    {
        RuleFor(x => x.ShipmentId)
            .NotEmpty().WithMessage("Shipment ID is required.");
    }
}
