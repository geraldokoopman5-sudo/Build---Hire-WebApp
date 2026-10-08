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
                address = j.address,
            });

        }

        public async Task<UpdateJobDetailsDto> UpdateJobDetailsAsync(Guid Id, UpdateJobDetailsDto dto)
        {
            var jobs = await _repo.GetJobById(Id);
            if (jobs == null) return null;

            if (dto.EndDate < jobs.StartDate)
                throw new ValidationException("EndDate cannot precede the existing StartDate.");

            jobs.EndDate = dto.EndDate;
            jobs.Status = dto.Status;
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
                Status = dto.Status,
                address = dto.address

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
                address = job.address,

            };
        }



        public async Task<string> DeleteJobAsync(Guid Id)
        {
            return await _repo.CancelJob(Id);
        }
    }
}
