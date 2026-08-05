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
        Task<AddWorkerDto> AddWorkerAsync(AddWorkerDto dto);
        Task<UpdateWorkerDto> UpdateWorkerAsync(Guid Id, UpdateWorkerDto dto);
        Task<string>DeleteWorkerAsync(Guid Id);
    }
}
