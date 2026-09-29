
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Validators.Workers
{
    public class WorkersValidator : AbstractValidator<AddWorkerDto>
    {
        public WorkersValidator()
        {
            RuleFor(w => w.WorkerFirstName)
                .NotEmpty()
                .MaximumLength(50);

            RuleFor(w => w.WorkerLastNAme)
            .NotEmpty()
            .MaximumLength(50); 
        }
    }
}
