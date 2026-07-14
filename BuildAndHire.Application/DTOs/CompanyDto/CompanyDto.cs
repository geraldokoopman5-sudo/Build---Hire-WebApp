using BuildAndHire.Domain.ValueObjects;
using BuildAndHire.Domain.Enums;
using BuildAndHire.Domain.Models;
namespace BuildAndHire.Application.DTOs.CompanyDto;

public class CompanyDto
{
     public Guid CompanyId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public Address? address { get; set; }

    public AccountStatus Status { get; set; }

       public Guid? JobId { get; set; }
   public Jobs? jobs { get; set; } 

    public double RegistrationNumber { get; set; }

    public double TaxNumber{ get; set; } 
}
