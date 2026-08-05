using BuildAndHire.Application.DTOs.JobDto;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Validators.Jobs
{
    public class UpdateJobsValidator : AbstractValidator<UpdateJobDetailsDto>
    {
        public UpdateJobsValidator()
        {

            RuleFor(j => j.DailyRate)
                .NotEmpty()
                .GreaterThan(0);
        }
    }
}
