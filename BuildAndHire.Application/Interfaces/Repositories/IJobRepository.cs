using BuildAndHire.Application.DTOs.JobDto;

namespace BuildAndHire.Application.Interfaces.Repositories;

public interface IJobRepository
{
    Task<IEnumerable<JobDto>> GetAllJobs();
    Task<JobDto> GetJobById(Guid id);
    Task<RegisterJobDto> RegisterJob(RegisterJobDto dto);
    Task<UpdateJobDetailsDto> UpdatejobDetails(UpdateJobDetailsDto dto);
    Task<string>CancelJob(Guid Id);
}
