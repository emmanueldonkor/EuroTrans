namespace EuroTrans.Application.features.Shipments.CreateShipment;

using FluentValidation;

public class CreateShipmentValidator : AbstractValidator<CreateShipmentRequest>
{
    public CreateShipmentValidator()
    {
        RuleFor(x => x.Cargo.Description).NotEmpty();
        RuleFor(x => x.Cargo.Weight).GreaterThan(0);
        RuleFor(x => x.Cargo.Volume).GreaterThan(0);

        RuleFor(x => x.Origin.AddressLine).NotEmpty();
        RuleFor(x => x.Origin.City).NotEmpty();
        RuleFor(x => x.Origin.Country).NotEmpty();
        RuleFor(x => x.Origin.PostalCode).NotEmpty();

        RuleFor(x => x.Destination.AddressLine).NotEmpty();
        RuleFor(x => x.Destination.City).NotEmpty();
        RuleFor(x => x.Destination.Country).NotEmpty();
        RuleFor(x => x.Destination.PostalCode).NotEmpty();
    }
}
