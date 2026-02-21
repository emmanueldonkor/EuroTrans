namespace EuroTrans.Application.features.Shipments.Milestone;

using FluentValidation;
using EuroTrans.Domain.Shipments.Enums;

public class MilestoneValidator : AbstractValidator<MilestoneRequest>
{
    public MilestoneValidator()
    {
        RuleFor(x => x.Type)
            .Must(type => Enum.IsDefined(typeof(MilestoneType), type))
            .WithMessage("Invalid milestone type.");

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90)
            .WithMessage("Latitude must be between -90 and 90.");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180)
            .WithMessage("Longitude must be between -180 and 180.");

        RuleFor(x => x.Note)
            .NotEmpty()
            .MaximumLength(1000)
            .WithMessage("Note must be between 1 and 1000 characters.");

        RuleFor(x => x.LocationLabel)
            .MaximumLength(200)
            .When(x => !string.IsNullOrWhiteSpace(x.LocationLabel))
            .WithMessage("Location label cannot exceed 200 characters.");
    }
}
