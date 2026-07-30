using BuildAndHire.Domain.Enums;

namespace BuildAndHire.Application.DTOs.CompanyDto
{
    public class RegisterCompanyDto
    {
        public Guid CompanyId { get; set; }
        public string CompanyName { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;
        public string CompanyEmail { get; set; } = string.Empty;
        public string RegistrationNumber { get; set; } = string.Empty;
        public string TaxNumber { get; set; } = string.Empty;
        public Address? address { get; set; }
    }
}
