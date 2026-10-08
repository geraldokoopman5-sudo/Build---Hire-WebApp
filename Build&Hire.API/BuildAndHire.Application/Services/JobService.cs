using BuildAndHire.Application.DTOs.JobDto;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Services
{
    public class JobService : IJobService
    {
        private readonly IJobRepository _repo;

        public JobService(IJobRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<JobDto>> GetAllJobsAsync()
        {
            var job = await _repo.GetAllJobs();
            return job.Select(j => new JobDto
            {
                JobId = j.JobId,
                JobDescription = j.JobDescription,
                CompanyId = j.CompanyId,
                CompanyName = j.companies?.CompanyName ?? string.Empty,
                DaysWorking = j.DaysWorking,
                PayingMethod = j.PayingMethod,
                PaymentStatus = j.Payment?.Status,
                AmountPaid = j.Payment?.Status == PaymentEnum.Successful ? j.Payment.Amount : 0,
                PaymentReference = j.Payment?.TransactionReference,
                CustomerId = j.CustomerId,
                Quote = j.Quote,
                StartDate = j.StartDate,
                EndDate = j.EndDate,
                Status = j.Status,
                AcceptedAt = j.AcceptedAt,
                QuoteSentAt = j.QuoteSentAt,
                QuoteAcceptedAt = j.QuoteAcceptedAt,
                address = j.address,
            });

        }

        public async Task<UpdateJobDetailsDto> UpdateJobDetailsAsync(Guid Id, UpdateJobDetailsDto dto)
        {
            var jobs = await _repo.GetJobById(Id);
            if (jobs == null) throw new KeyNotFoundException("Job not found.");

            if (jobs.Status != JobEnum.Accepted)
                throw new ValidationException("Only accepted jobs can be edited.");
            if (dto.PayingMethod != jobs.PayingMethod && jobs.Payment != null)
                throw new ValidationException("The payment method cannot change after a payment record exists.");
            if (dto.Quote != jobs.Quote)
            {
                if (jobs.QuoteAcceptedAt != null || jobs.Payment != null)
                    throw new ValidationException("The quote is locked after customer acceptance or payment creation.");
                jobs.QuoteSentAt = dto.Quote > 0 ? new DateTime(DateTime.UtcNow.Ticks / 10 * 10, DateTimeKind.Utc) : null;
            }

            if (dto.EndDate < jobs.StartDate)
                throw new ValidationException("EndDate cannot precede the existing StartDate.");

            jobs.EndDate = dto.EndDate;
            if (dto.Status.HasValue && dto.Status != jobs.Status)
                throw new ValidationException("Use the job lifecycle endpoints to change status.");
            jobs.Quote = dto.Quote;
            jobs.PayingMethod = dto.PayingMethod;

            var updated = await _repo.UpdatejobDetails(jobs);

            return new UpdateJobDetailsDto
            {
                EndDate = updated.EndDate,
                Quote = updated.Quote,
                Status = updated.Status,
                PayingMethod = updated.PayingMethod,
            };

        }

        public async Task<JobDto?> GetJobByIdAsync(Guid Id)
{
    var job =
        await _repo.GetJobById(Id);

    if (job == null)
    {
        return null;
    }

    return new JobDto
    {
        JobId = job.JobId,
        JobDescription = job.JobDescription,
        CompanyId = job.CompanyId,
                CompanyName = job.companies?.CompanyName ?? string.Empty,
                PayingMethod = job.PayingMethod,
                PaymentStatus = job.Payment?.Status,
                AmountPaid = job.Payment?.Status == PaymentEnum.Successful ? job.Payment.Amount : 0,
                PaymentReference = job.Payment?.TransactionReference,
        CustomerId = job.CustomerId,
        StartDate = job.StartDate,
        DaysWorking = job.DaysWorking,
        Quote = job.Quote,
        EndDate = job.EndDate,
        Status = job.Status,
        AcceptedAt = job.AcceptedAt,
        QuoteSentAt = job.QuoteSentAt,
        QuoteAcceptedAt = job.QuoteAcceptedAt,
        address = job.address,
    };
}

        public async Task<JobDto> RegisterJobAsync(RegisterJobDto dto)
        {
            var newJob = new Jobs
            {
                JobDescription = dto.JobDescription,
                CompanyId = dto.CompanyId,
                CustomerId = dto.CustomerId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                DaysWorking = dto.DaysWorking,
                PayingMethod = dto.PayingMethod,
                Status = JobEnum.Requested,
                address = dto.address ?? throw new ValidationException("An address is required.")

            };

            var job = await _repo.RegisterJob(newJob);
            return new JobDto
            {
                JobId = job.JobId,
                JobDescription = job.JobDescription,
                CompanyId = job.CompanyId,
                CompanyName = job.companies?.CompanyName ?? string.Empty,
                PayingMethod = job.PayingMethod,
                CustomerId = job.CustomerId,
                StartDate = job.StartDate,
                EndDate = job.EndDate,
                DaysWorking = job.DaysWorking,
                Status = job.Status,
                AcceptedAt = job.AcceptedAt,
                QuoteSentAt = job.QuoteSentAt,
                QuoteAcceptedAt = job.QuoteAcceptedAt,
                address = job.address,

            };
        }



        public async Task<string> DeleteJobAsync(Guid Id)
        {
            return await _repo.CancelJob(Id);
        }
    }
}
