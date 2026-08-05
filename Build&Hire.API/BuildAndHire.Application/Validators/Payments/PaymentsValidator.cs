
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Validators.Payments
{
    public class PaymentsValidator : AbstractValidator<PayPaymentsDto>
    {
        public PaymentsValidator()
        {
            RuleFor(p => p.Amount)
                .NotNull()
                .GreaterThan(0);

            RuleFor(p => p.PaymentDate)
                .NotNull()
                .Equal(DateTime.UtcNow);

        }
    }
}
