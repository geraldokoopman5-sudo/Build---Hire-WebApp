using BuildAndHire.Application.DTOs.AuthDto;
using BuildAndHire.Domain.Enums;
using Microsoft.AspNetCore.Identity;


namespace BuildAndHire.Application.DTOs.CompanyDto
{
    public class CompanyDto 
    {
        public Guid CompanyId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string CompanyEmail { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public Address? address { get; set; }
        public AccountStatus Status { get; set; }
        public string RegistrationNumber { get; set; } = string.Empty;
        public string TaxNumber { get; set; } = string.Empty;
    }
}
