namespace EuroTrans.Application.features.Shipments.GetShipmentActivities;

using FluentValidation;

public class GetShipmentActivitiesValidator : AbstractValidator<Guid>
{
    public GetShipmentActivitiesValidator()
    {
        RuleFor(x => x).NotEmpty().WithMessage("Shipment ID is required.");
    }
}
