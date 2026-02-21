namespace EuroTrans.Application.features.Shipments.GetShipmentActivities;

using FluentValidation;

public class GetShipmentActivitiesValidator : AbstractValidator<GetShipmentActivitiesRequest>
{
    public GetShipmentActivitiesValidator()
    {
        RuleFor(x => x.ShipmentId).NotEmpty().WithMessage("Shipment ID is required.");
    }
}
