using BuildAndHire.Domain.Enums;
using BuildAndHire.Domain.Models;

namespace BuildAndHire.Domain.Scheduling;

public static class JobCalendar
{
    // Project dates use South African calendar days (UTC+02:00, no daylight saving).
    public static DateTime Today(DateTime utcNow) => utcNow.AddHours(2).Date;

    public static int DaysWorking(Jobs job, DateTime utcNow)
    {
        if (job.Status is JobEnum.Completed or JobEnum.Cancelled)
            return Math.Max(0, job.DaysWorking);
        if (job.Status is not (JobEnum.Accepted or JobEnum.InProgress)) return 0;

        // Include the start date and weekends. A planned end date does not close a job.
        return Math.Max(0, (Today(utcNow) - job.StartDate.Date).Days + 1);
    }
}
