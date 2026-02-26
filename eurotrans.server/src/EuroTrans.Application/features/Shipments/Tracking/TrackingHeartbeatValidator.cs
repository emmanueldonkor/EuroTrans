using FluentValidation;

namespace EuroTrans.Application.features.Shipments.Tracking;

public class TrackingHeartbeatValidator : AbstractValidator<TrackingHeartbeatRequest>
{
    public TrackingHeartbeatValidator()
    {
        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90)
            .WithMessage("Latitude must be between -90 and 90.");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180)
            .WithMessage("Longitude must be between -180 and 180.");

        RuleFor(x => x.LocationLabel)
            .MaximumLength(200)
            .When(x => !string.IsNullOrWhiteSpace(x.LocationLabel))
            .WithMessage("Location label cannot exceed 200 characters.");
    }
}
