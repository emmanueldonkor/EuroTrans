using FluentValidation;

namespace EuroTrans.Application.features.Employees.User.UpdatePreferredLanguage;

public class UpdatePreferredLanguageValidator : AbstractValidator<UpdatePreferredLanguageRequest>
{
    private static readonly string[] SupportedLanguages = ["en", "de", "fr"];

    public UpdatePreferredLanguageValidator()
    {
        RuleFor(x => x.PreferredLanguage)
            .NotEmpty()
            .Must(language => SupportedLanguages.Contains(language.Trim().ToLowerInvariant()))
            .WithMessage("Preferred language must be one of: en, de, fr.");
    }
}
