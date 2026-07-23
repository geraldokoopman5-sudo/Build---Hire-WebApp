using BuildAndHire.Domain.ValueObjects;
using BuildAndHire.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Domain.Models
{
    public class Payment
    {
        public Guid PaymentId { get; set; }

        public Guid JobId { get; set; }

        public Jobs Job { get; set; } = null!;

        public Guid CustomerId { get; set; }

        public Customer Customer { get; set; } = null!;
        
        public Guid CompanyId { get; set; }
        public Companies? Companies { get; set; }

        public decimal Amount { get; set; }

        public PaymentMethod PaymentMethod { get; set; }

        public PaymentEnum Status { get; set; }

        public DateTime PaymentDate { get; set; }

        public string? TransactionReference { get; set; }
    }
}
