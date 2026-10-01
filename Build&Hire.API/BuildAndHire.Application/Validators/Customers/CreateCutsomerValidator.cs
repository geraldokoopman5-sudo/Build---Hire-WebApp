namespace BuildAndHire.Application.Validators.Customers;

public class CreateCutsomerValidator : AbstractValidator<CreateCustomerDto>
{
    public CreateCutsomerValidator()
    {
        RuleFor(x => x.CustomerName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(12);
        RuleFor(x => x.address).NotNull().SetValidator(new AddressValidator()!);
    }
}
