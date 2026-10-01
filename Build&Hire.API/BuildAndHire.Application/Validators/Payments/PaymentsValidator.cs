namespace BuildAndHire.Application.Validators.Payments;

public class PaymentsValidator : AbstractValidator<PayPaymentsDto>
{
    public PaymentsValidator()
    {
        RuleFor(x => x.JobId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.PaymentMethod).IsInEnum();
    }
}
