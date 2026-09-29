using BuildAndHire.Application.DTOs.JobDto;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Validators.Jobs
{
    public class RegisterJobvalidator : AbstractValidator<RegisterJobDto>
    {
        public RegisterJobvalidator()
        {
            RuleFor(j => j.JobDescription)
                 .MaximumLength(100)
                 .NotEmpty();

            RuleFor(j => j.DaysWorking)
                .NotEmpty()
                .GreaterThan(0);              

            RuleFor(j => j.StartDate)
                .LessThan(e => e.EndDate)
                .NotEmpty()
                .GreaterThan(DateTime.Now);

            RuleFor(j => j.EndDate)
                .GreaterThan(L => L.StartDate)
                .NotEmpty();

        }
    }
}
