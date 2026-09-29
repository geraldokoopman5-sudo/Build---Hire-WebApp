using BuildAndHire.Application.DTOs.CompanyDto;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Validators.Company
{
    public class CreateCompanyValidator : AbstractValidator<RegisterCompanyDto>
    {
        public CreateCompanyValidator()
        {
            RuleFor(c => c.CompanyName)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(c => c.CompanyEmail)
                .NotEmpty()
                .EmailAddress();

            RuleFor(cp => cp.TaxNumber)
                .NotEmpty()
                .MaximumLength(10);
        }
    }
}
