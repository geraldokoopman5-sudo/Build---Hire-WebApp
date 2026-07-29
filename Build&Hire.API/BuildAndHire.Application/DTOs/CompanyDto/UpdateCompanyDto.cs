using BuildAndHire.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.CompanyDto
{
    public class UpdateCompanyDto
    {
        public string CompanyName { get; set; } = string.Empty;

        public string CompanyEmail { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public Address? address { get; set; }

        public AccountStatus Status { get; set; }

        public string RegistrationNumber { get; set; } = string.Empty;

        public string TaxNumber { get; set; } = string.Empty;
    }
}
