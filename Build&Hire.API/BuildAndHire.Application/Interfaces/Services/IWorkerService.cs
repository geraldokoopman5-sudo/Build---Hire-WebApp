using BuildAndHire.Application.DTOs.WokerDto;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Interfaces.Services
{
    public interface IWorkerService
    {
        Task<IEnumerable<WorkerDto>> GetAllWorkersAsync();
        Task<WorkerDto> GetWorkersByIdAsync(Guid Id);
        Task<AddWorkerDto> AddWorkerAsync(WorkerDto dto);
        Task<UpdateWorkerDto> UpdateWorkerAsync(WorkerDto dto);
        Task<string>DeleteWokerAsync(Guid Id);
    }
}
