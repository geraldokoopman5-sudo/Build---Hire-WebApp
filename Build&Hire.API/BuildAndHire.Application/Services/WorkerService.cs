    using BuildAndHire.Application.DTOs.WokerDto;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Services
{
    public class WorkerService : IWorkerService
    {
        private readonly IWorkersRepository _repo;

        public WorkerService(IWorkersRepository repo)
        {
            _repo = repo;
        }
        public async Task<IEnumerable<WorkerDto>> GetAllWorkersAsync()
        {
            var wrk = await _repo.GetAllWorkers();

            return wrk.Select(w => new WorkerDto
            {
                WorkerId = w.WorkerId,
                WorkerFirstName = w.WorkerFirstName,
                WorkerLastNAme = w.WorkerLastNAme,
                WorkerStatus = w.WorkerStatus,
                CompanyId = w.CompanyId,
                ResidingCompany = w.ResidingCompany,
                JobId = w.JobId,
            });
        }

        public async Task<WorkerDto> GetWorkersByIdAsync(Guid Id)
        {
            var getWorker = await _repo.GetWorkersById(Id);

            if (getWorker == null) throw new KeyNotFoundException("Worker not found");

            return new WorkerDto
            {
                WorkerId = getWorker.WorkerId,
                WorkerFirstName = getWorker.WorkerFirstName,
                WorkerLastNAme = getWorker.WorkerLastNAme,
                WorkerStatus = getWorker.WorkerStatus,
                CompanyId = getWorker.CompanyId,
                JobId = getWorker.JobId,
            };
        }

        public async Task<AddWorkerDto> AddWorkerAsync(AddWorkerDto dto)
        {
            var addworker = new Workers
            {
                WorkerId = dto.WorkerId,
                WorkerFirstName = dto.WorkerFirstName,
                WorkerLastNAme = dto.WorkerLastNAme,
                WorkerStatus = dto.WorkerStatus,
                CompanyId = dto.CompanyId,
                JobId = dto.JobId,
            };

            var worker = await _repo.RegisterWorker(addworker);

            return new AddWorkerDto
            {
                WorkerId = worker.WorkerId,
                WorkerFirstName = worker.WorkerFirstName,
                WorkerLastNAme = worker.WorkerLastNAme,
                WorkerStatus = worker.WorkerStatus,
                CompanyId = worker.CompanyId,
                JobId = worker.CompanyId,
            };
        }

        public async Task<string> DeleteWokerAsync(Guid Id)
        {
            return await _repo.DeleteAbdu(Id);
        }

        public async Task<UpdateWorkerDto> UpdateWorkerAsync(Guid Id, UpdateWorkerDto dto)
        {
            var getWorker = await _repo.GetWorkersById(Id);
            if (getWorker == null) throw new KeyNotFoundException("Worker not found");

            getWorker.WorkerStatus = dto.WorkerStatus;

            var updated = await _repo.UpdateWorkerDetail(getWorker);

            return new UpdateWorkerDto
            {
                WorkerStatus = updated.WorkerStatus,
            };
        }
    }
}
