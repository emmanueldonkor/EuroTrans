using FluentValidation;

namespace EuroTrans.Application.features.Trucks.GetTrucks;

public class GetTrucksValidator : AbstractValidator<GetTrucksRequest>
{
    public GetTrucksValidator()
    {
        RuleFor(x => x.Search)
            .MaximumLength(100)
            .When(x => !string.IsNullOrWhiteSpace(x.Search))
            .WithMessage("Search must be at most 100 characters.");

        RuleFor(x => x.Page)
            .GreaterThan(0)
            .WithMessage("Page must be greater than 0.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("PageSize must be between 1 and 100.");
    }
}
