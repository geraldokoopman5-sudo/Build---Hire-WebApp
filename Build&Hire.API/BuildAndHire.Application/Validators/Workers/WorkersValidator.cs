namespace BuildAndHire.Application.Validators.Workers;

public class WorkersValidator : AbstractValidator<AddWorkerDto>
{
    public WorkersValidator()
    {
        RuleFor(x => x.WorkerFirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.WorkerLastName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.JobId).NotEmpty();
        RuleFor(x => x.WorkerStatus).IsInEnum();
    }
}
