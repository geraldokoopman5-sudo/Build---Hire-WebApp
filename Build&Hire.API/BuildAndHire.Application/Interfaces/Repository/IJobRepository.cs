using BuildAndHire.Application.DTOs.JobDto;
using BuildAndHire.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Interfaces.Repository
{
    public interface IJobRepository
    {
        Task<IEnumerable<Jobs>> GetAllJobs();
        Task<Jobs> GetJobById(Guid id);
        Task<Jobs> RegisterJob(Jobs job);
        Task<Jobs> UpdatejobDetails(Jobs job);
        Task<string> CancelJob(Guid Id);
    }
}
