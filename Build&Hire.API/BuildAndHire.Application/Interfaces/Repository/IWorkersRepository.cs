using BuildAndHire.Application.DTOs.WokerDto;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Interfaces.Repository
{
    public interface IWorkersRepository
    {
        Task<IEnumerable<WorkerDto>> GetAllWorkers();
        Task<WorkerDto> GetWorkersById(Guid Id);
        Task<AddWorkerDto> RegisterWorker(AddWorkerDto dto);
        Task<UpdateWorkerDto> UpdateWorkerDetail(UpdateWorkerDto dto);
        Task<string> DeleteAbdu(Guid Id);
    }
}
