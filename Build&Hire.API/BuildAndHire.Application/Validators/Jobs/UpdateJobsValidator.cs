namespace BuildAndHire.Application.Validators.Jobs;

public class UpdateJobsValidator : AbstractValidator<UpdateJobDetailsDto>
{
    public UpdateJobsValidator()
    {
        RuleFor(x => x.Quote).InclusiveBetween(0, 99999999.99m)
            .Must(x => decimal.Round(x, 2) == x).WithMessage("Quote must have at most two decimal places.");
        RuleFor(x => x.EndDate).NotEmpty().Must(x => x.Kind == DateTimeKind.Utc)
            .WithMessage("EndDate must be UTC (include Z).");
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.PayingMethod).IsInEnum();
    }
}
