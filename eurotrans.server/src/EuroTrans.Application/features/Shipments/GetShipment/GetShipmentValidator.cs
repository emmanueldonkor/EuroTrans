namespace EuroTrans.Application.features.Shipments.GetShipment;

using FluentValidation;

public class GetShipmentByIdValidator : AbstractValidator<Guid>
{
    public GetShipmentByIdValidator()
    {
        RuleFor(x => x).NotEmpty().WithMessage("Shipment ID is required.");
    }
}
