using BuildAndHire.Domain.Enums;
using System;
using BuildAndHire.Domain.ValueObjects;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Domain.Models
{
    public class Customer
    {
        public Guid CustomerId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public AccountStatus Status { get; set; }

        public Address? address { get; set; }

        public ICollection<Jobs> Jobs { get; set; } = new List<Jobs>();

        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
