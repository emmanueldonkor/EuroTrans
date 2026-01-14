namespace EuroTrans.Application.features.Shipments.Milestone;

using FluentValidation;

public class MilestoneValidator : AbstractValidator<MilestoneRequest>
{
    public MilestoneValidator()
    {
        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90)
            .WithMessage("Latitude must be between -90 and 90.");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180)
            .WithMessage("Longitude must be between -180 and 180.");

        RuleFor(x => x.Note)
            .NotEmpty()
            .WithMessage("Note is required.");
    }
}
