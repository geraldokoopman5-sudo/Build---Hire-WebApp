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
                CustomerId = j.CustomerId,
                StartDate = j.StartDate,
                EndDate = j.EndDate,
                DailyRate = j.DailyRate,
                Status = j.Status,
                address = j.address,
            });

        }

        public async Task<UpdateJobDetailsDto> UpdateJobDetailsAsync(Guid Id, UpdateJobDetailsDto dto)
        {
            var jobs = await _repo.GetJobById(Id);
            if (jobs == null) return null;

            jobs.DailyRate = dto.DailyRate;
            jobs.EndDate = dto.EndDate;
            jobs.Status = dto.Status;
            jobs.PayingMethod = dto.PayingMethod;

            var updated = await _repo.UpdatejobDetails(jobs);

            return new UpdateJobDetailsDto
            {
                DailyRate = updated.DailyRate,
                EndDate = updated.EndDate,
                Status = updated.Status,
                PayingMethod = updated.PayingMethod,
            };

        }

        public async Task<JobDto> GetJobByIdAsync(Guid Id)
        {
            var job = await _repo.GetJobById(Id);

            return new JobDto
            {
                JobId = job.JobId,
                JobDescription = job.JobDescription,
                CompanyId = job.CompanyId,
                CustomerId = job.CustomerId,
                StartDate = job.StartDate,
                EndDate = job.EndDate,
                DailyRate = job.DailyRate,
                Status = job.Status,
                address = job.address,
            };
        }

        public async Task<RegisterJobDto> RegisterJobAsync(RegisterJobDto dto)
        {
            var newJob = new Jobs
            {
                JobId = dto.JobId,
                JobDescription = dto.JobDescription,
                CompanyId = dto.CompanyId,
                CustomerId = dto.CustomerId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                DaysWorking = dto.DaysWorking,
                DailyRate = dto.DailyRate,
                Status = dto.Status,
                address = dto.address,  

            };

            var job = await _repo.RegisterJob(newJob);
            return new RegisterJobDto
            {
                JobId = job.JobId,
                JobDescription = job.JobDescription,
                CompanyId = job.CompanyId,
                CustomerId = job.CustomerId,
                StartDate = job.StartDate,
                EndDate = job.EndDate,
                DaysWorking = job.DaysWorking,
                DailyRate = job.DailyRate,
                Status = job.Status,
                address = job.address,

            };
        }



        public Task<string> DeleteJobAsync(Guid Id)
        {
            throw new NotImplementedException();
        }
    }
}
