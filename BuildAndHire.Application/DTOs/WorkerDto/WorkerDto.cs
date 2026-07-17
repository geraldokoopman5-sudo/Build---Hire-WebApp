using BuildAndHire.Domain.Enums;
using BuildAndHire.Domain.Models;
namespace BuildAndHire.Application.DTOs.WorkerDto;

public class WorkerDto
{
    public Guid WorkerId { get; set; }

    public string WorkerFirstName { get; set; } = string.Empty;

    public string WorkerLastNAme { get; set; } = string.Empty;

    public AccountStatus WorkerStatus { get; set; } 
    public Guid CompanyId { get; set; }

    public Companies? ResidingCompany { get; set; }

    public Guid JobId { get; set; }

    public Jobs? Job { get; set; }
}
