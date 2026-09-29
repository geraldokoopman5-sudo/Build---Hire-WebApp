using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Validators.Customers
{
    public class CreateCutsomerValidator : AbstractValidator<CreateCustomerDto>
    {
        public CreateCutsomerValidator()
        {
            RuleFor(c => c.Email)
                .NotEmpty()
                .EmailAddress();

            RuleFor(c => c.PasswordHash)
                .MaximumLength(20)
                .MinimumLength(6);

            RuleFor(c => c.CustomerName)
                .MaximumLength(20)
                .NotEmpty();

            
        }
    }
}
