using BuildAndHire.Domain.Enums;
namespace BuildAndHire.Application.DTOs.WorkerDto;

public class UpdateWorkerDto
{
    public AccountStatus WorkerStatus { get; set; }
}
