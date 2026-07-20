using BuildAndHire.Domain.Entities;
using BuildAndHire.Domain.Enums;
using BuildAndHire.Domain.ValueObjects;

namespace BuildAndHire.Application.DTOs.CompanyDto
{
    public class RegisterCompanyDto
    {
        public Guid CompanyId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public double RegistrationNumber { get; set; }
        public double TaxNumber { get; set; }
        public Address? address { get; set; }
    }
}
