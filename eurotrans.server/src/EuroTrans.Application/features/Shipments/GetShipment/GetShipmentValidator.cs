namespace EuroTrans.Application.features.Shipments.GetShipment;

using FluentValidation;

public class GetShipmentByIdValidator : AbstractValidator<GetShipmentRequest>
{
    public GetShipmentByIdValidator()
    {
        RuleFor(x => x.ShipmentId).NotEmpty().WithMessage("Shipment ID is required.");
    }
}
