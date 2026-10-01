namespace BuildAndHire.Application.Validators.Jobs;

public class UpdateJobsValidator : AbstractValidator<UpdateJobDetailsDto>
{
    public UpdateJobsValidator()
    {
        RuleFor(x => x.Quote).GreaterThanOrEqualTo(0);
        RuleFor(x => x.EndDate).NotEmpty().Must(x => x.Kind == DateTimeKind.Utc)
            .WithMessage("EndDate must be UTC (include Z).");
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.PayingMethod).IsInEnum();
    }
}
