using BuildAndHire.Application.DTOs.WorkerDto;

namespace BuildAndHire.Application.Interfaces.Repositories;

public interface IWorkerRepository
{
    Task<IEnumerable<WorkerDto>> GetAllWorkers();
    Task<WorkerDto> GetWorkersById(Guid Id);
    Task<AddWorkerDto> RegisterWorker(AddWorkerDto dto);
    Task<UpdateWorkerDto> UpdateWorkerDetail(UpdateWorkerDto dto);
    Task<string>DeleteAbdu(Guid Id);
}
