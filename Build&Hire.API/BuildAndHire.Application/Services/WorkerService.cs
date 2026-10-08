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
                WorkerLastName = w.WorkerLastName,
                WorkerStatus = w.WorkerStatus,
                CompanyId = w.CompanyId,

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
                WorkerLastName = getWorker.WorkerLastName,
                WorkerStatus = getWorker.WorkerStatus,
                CompanyId = getWorker.CompanyId,
                JobId = getWorker.JobId,
            };
        }

        public async Task<AddWorkerDto> AddWorkerAsync(AddWorkerDto dto)
        {
            var addworker = new Workers
            {
                WorkerFirstName = dto.WorkerFirstName,
                WorkerLastName = dto.WorkerLastName,
                WorkerStatus = dto.WorkerStatus,
                CompanyId = dto.CompanyId,
                JobId = dto.JobId,
            };

            var worker = await _repo.RegisterWorker(addworker);

            return new AddWorkerDto
            {
                WorkerId = worker.WorkerId,
                WorkerFirstName = worker.WorkerFirstName,
                WorkerLastName = worker.WorkerLastName,
                WorkerStatus = worker.WorkerStatus,
                CompanyId = worker.CompanyId,
                JobId = worker.JobId,
            };
        }

        public async Task<string> DeleteWorkerAsync(Guid Id)
        {
            return await _repo.DeleteAbdu(Id);
        }

        public async Task<UpdateWorkerDto> UpdateWorkerAsync(Guid Id, UpdateWorkerDto dto)
        {
            var getWorker = await _repo.GetWorkersById(Id);
            if (getWorker == null) throw new KeyNotFoundException("Worker not found");

            getWorker.WorkerStatus = dto.WorkerStatus;
            if (dto.WorkerFirstName != null)
            {
                if (string.IsNullOrWhiteSpace(dto.WorkerFirstName)) throw new ArgumentException("Worker first name is required.");
                getWorker.WorkerFirstName = dto.WorkerFirstName.Trim();
            }
            if (dto.WorkerLastName != null)
            {
                if (string.IsNullOrWhiteSpace(dto.WorkerLastName)) throw new ArgumentException("Worker last name is required.");
                getWorker.WorkerLastName = dto.WorkerLastName.Trim();
            }

            var updated = await _repo.UpdateWorkerDetail(getWorker);

            return new UpdateWorkerDto
            {
                WorkerStatus = updated.WorkerStatus,
                WorkerFirstName = updated.WorkerFirstName,
                WorkerLastName = updated.WorkerLastName,
            };
        }
    }
}
