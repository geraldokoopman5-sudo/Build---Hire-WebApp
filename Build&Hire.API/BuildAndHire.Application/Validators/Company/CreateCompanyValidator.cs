namespace BuildAndHire.Application.Validators.Company;

public class CreateCompanyValidator : AbstractValidator<RegisterCompanyDto>
{
    public CreateCompanyValidator()
    {
        RuleFor(x => x.CompanyName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.CompanyEmail).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(12);
        RuleFor(x => x.RegistrationNumber).NotEmpty().Matches(@"^\d{10}$");
        RuleFor(x => x.TaxNumber).NotEmpty().Matches(@"^\d{10}$");
        RuleFor(x => x.address).NotNull().SetValidator(new AddressValidator()!);
    }
}
