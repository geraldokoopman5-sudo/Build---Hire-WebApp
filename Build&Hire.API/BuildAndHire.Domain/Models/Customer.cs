using BuildAndHire.Domain.Enums;
using BuildAndHire.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Domain.Models
{
    public class Customer
    {
        public Guid CustomerId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public AccountStatus Status { get; set; } = AccountStatus.Active;
        public AccountType accountType { get; set; } = AccountType.Customer;

        public Address address { get; set; } = null!;

        public ICollection<Jobs> Jobs { get; set; } = new List<Jobs>();

        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
