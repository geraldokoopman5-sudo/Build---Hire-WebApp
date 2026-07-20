using BuildAndHire.Application.DTOs.JobDto;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Interfaces.Services
{
    public interface IJobService
    {
        Task<IEnumerable<JobDto>> GetAllJobsAsync();
        Task<JobDto> GetJobByIdAsync(Guid Id);
        Task<RegisterJobDto> RegisterJobAsync(RegisterJobDto dto);
        Task<UpdateJobDetailsDto> UpdateJobDetailsAsync(UpdateJobDetailsDto dto);
        Task<string> DeleteJobAsync(Guid Id);   
    }
}
