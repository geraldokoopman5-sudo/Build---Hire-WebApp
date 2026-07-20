using BuildAndHire.Application.DTOs.JobDto;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Interfaces.Repository
{
    public interface IJobRepository
    {
        Task<IEnumerable<JobDto>> GetAllJobs();
        Task<JobDto> GetJobById(Guid id);
        Task<RegisterJobDto> RegisterJob(RegisterJobDto dto);
        Task<UpdateJobDetailsDto> UpdatejobDetails(UpdateJobDetailsDto dto);
        Task<string> CancelJob(Guid Id);
    }
}
