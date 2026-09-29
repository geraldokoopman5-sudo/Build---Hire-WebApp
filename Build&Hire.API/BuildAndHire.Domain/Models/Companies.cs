using BuildAndHire.Domain.Enums;
using BuildAndHire.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Net;
using System.Text;

namespace BuildAndHire.Domain.Models
{
    public class Companies
    {
        public Guid CompanyId { get; set; }

        public string CompanyName { get; set; } = string.Empty;

        public string CompanyEmail { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public Address address { get; set; } = null!;

        public AccountStatus Status { get; set; } = AccountStatus.Active;
        public AccountType account { get; set; } = AccountType.Company;
        public string RegistrationNumber { get; set; } = string.Empty;

        public string TaxNumber { get; set; } = string.Empty;

        public ICollection<Jobs> Jobs { get; set; } = new List<Jobs>();

        public List<Workers> Workers { get; set; } = new List<Workers>();

    }
}
