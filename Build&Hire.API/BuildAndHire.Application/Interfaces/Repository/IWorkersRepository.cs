using BuildAndHire.Application.DTOs.WokerDto;
using BuildAndHire.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Interfaces.Repository
{
    public interface IWorkersRepository
    {
        Task<IEnumerable<Workers>> GetAllWorkers();
        Task<Workers> GetWorkersById(Guid Id);
        Task<Workers> RegisterWorker(Workers dto);
        Task<Workers> UpdateWorkerDetail(Workers dto);
        Task<string> DeleteAbdu(Guid Id);
    }
}
