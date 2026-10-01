namespace BuildAndHire.Application.Validators.Jobs;

public class RegisterJobvalidator : AbstractValidator<RegisterJobDto>
{
    public RegisterJobvalidator()
    {
        RuleFor(x => x.CompanyId).NotEmpty();
        RuleFor(x => x.JobDescription).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.DaysWorking).GreaterThan(0);
        RuleFor(x => x.StartDate).NotEmpty().Must(x => x.Kind == DateTimeKind.Utc)
            .WithMessage("StartDate must be UTC (include Z).").Must(x => x.Date >= DateTime.UtcNow.Date)
            .WithMessage("StartDate cannot be in the past.");
        RuleFor(x => x.EndDate).NotEmpty().Must(x => x.Kind == DateTimeKind.Utc)
            .WithMessage("EndDate must be UTC (include Z).").GreaterThanOrEqualTo(x => x.StartDate);
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.PayingMethod).IsInEnum();
        RuleFor(x => x.address).NotNull().SetValidator(new AddressValidator()!);
    }
}
