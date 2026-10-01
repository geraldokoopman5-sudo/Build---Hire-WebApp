namespace BuildAndHire.Application.Validators.Customers;

public class UpdateCustomerValidator : AbstractValidator<UpdateCustomerDto>
{
    public UpdateCustomerValidator()
    {
        RuleFor(x => x.CustomerName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.Address).NotNull().SetValidator(new AddressValidator()!);
    }
}
