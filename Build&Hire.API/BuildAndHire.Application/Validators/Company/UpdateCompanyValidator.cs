namespace BuildAndHire.Application.Validators.Company;

public class UpdateCompanyValidator : AbstractValidator<UpdateCompanyDto>
{
    public UpdateCompanyValidator()
    {
        RuleFor(x => x.CompanyName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.CompanyEmail).NotEmpty().EmailAddress();
        RuleFor(x => x.RegistrationNumber).NotEmpty().Matches(@"^\d{10}$");
        RuleFor(x => x.TaxNumber).NotEmpty().Matches(@"^\d{10}$");
        RuleFor(x => x.address).NotNull().SetValidator(new AddressValidator()!);
    }
}
