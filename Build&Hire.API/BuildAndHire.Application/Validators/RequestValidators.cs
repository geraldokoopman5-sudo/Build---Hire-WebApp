namespace BuildAndHire.Application.Validators;

public class AddressValidator : AbstractValidator<Address>
{
    public AddressValidator()
    {
        RuleFor(x => x.StreetAddress).NotEmpty();
        RuleFor(x => x.Suburb).NotEmpty();
        RuleFor(x => x.City).NotEmpty();
        RuleFor(x => x.Province).NotEmpty();
        RuleFor(x => x.PostalCode).InclusiveBetween(0, 9999);
    }
}

public class LoginValidator : AbstractValidator<LoginRequestDto>
{
    public LoginValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class UpdateWorkerValidator : AbstractValidator<UpdateWorkerDto>
{
    public UpdateWorkerValidator() => RuleFor(x => x.WorkerStatus).IsInEnum();
}

public class PaymentResponseValidator : AbstractValidator<PaymentResponseDto>
{
    public PaymentResponseValidator() => RuleFor(x => x.Status).IsInEnum();
}

public class AddAdminValidator : AbstractValidator<AddAdmin>
{
    public AddAdminValidator()
    {
        RuleFor(x => x.UserName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(12);
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.AdminRole).IsInEnum();
    }
}

public class UpdateAdminValidator : AbstractValidator<UpdateAdmin>
{
    public UpdateAdminValidator()
    {
        RuleFor(x => x.UserName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).MinimumLength(12).When(x => x.Password != null);
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.AdminRole).IsInEnum();
    }
}

public class UpdateCompanyStatusValidator : AbstractValidator<UpdateCompanyStatusDto>
{
    public UpdateCompanyStatusValidator() => RuleFor(x => x.Status).IsInEnum();
}
