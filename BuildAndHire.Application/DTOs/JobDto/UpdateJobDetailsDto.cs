using BuildAndHire.Domain.Models;
using BuildAndHire.Domain.ValueObjects;
using BuildAndHire.Domain.Enums;
namespace BuildAndHire.Application.DTOs.JobDto;

public class UpdateJobDetailsDto
{
    
    public decimal DailyRate { get; set; }

    public DateTime EndDate { get; set; }

    public JobStatus Status { get; set; }
    
    public Paymentmethod? PayingMethod { get; set; }
    
}
