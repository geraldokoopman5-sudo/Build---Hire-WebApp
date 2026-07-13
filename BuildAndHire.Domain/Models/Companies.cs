using BuildAndHire.Domain.ValueObjects;
using BuildAndHire.Domain.Enums;

namespace BuildAndHire.Domain.Models;

public class Companies
{
    public Guid CompanyId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public Address? adress { get; set; }

    public AccountStatus Status { get; set; }

    public double RegistrationNumber { get; set; }

    public double TaxNumber{ get; set; } 
}
