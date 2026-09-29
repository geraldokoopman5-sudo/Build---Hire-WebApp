using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.AuthDto
{
    public class CompanyLoginResponseDto : LoginresponseDto
    {
        public Guid CompanyId { get; set; }

        public string CompanyName { get; set; } = string.Empty;

        public string CompanyEmail { get; set; } = string.Empty;

        public AccountStatus Status { get; set; }

        public Guid? JobId { get; set; }

        public Jobs? Jobs { get; set; }

        public Address? Address { get; set; }

        public string RegistrationNumber { get; set; } = string.Empty;

        public string TaxNumber { get; set; } = string.Empty;
    }
}
