namespace EuroTrans.Application.features.Shipments.GetShipments;

using FluentValidation;

public class GetShipmentsValidator : AbstractValidator<GetShipmentsRequest>
{
    public GetShipmentsValidator()
    {
        RuleFor(x => x.StartDate)
            .LessThanOrEqualTo(x => x.EndDate)
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue)
            .WithMessage("StartDate must be before EndDate.");
    }
}
