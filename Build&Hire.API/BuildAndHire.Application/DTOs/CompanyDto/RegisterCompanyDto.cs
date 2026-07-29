using BuildAndHire.Domain.Enums;

namespace BuildAndHire.Application.DTOs.CompanyDto
{
    public class RegisterCompanyDto
    {
        public Guid CompanyId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string CompanyEmail { get; set; } = string.Empty;
        public double RegistrationNumber { get; set; }
        public double TaxNumber { get; set; }
        public Address? address { get; set; }
    }
}
