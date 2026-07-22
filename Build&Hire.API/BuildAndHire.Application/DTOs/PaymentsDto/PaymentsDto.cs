using BuildAndHire.Domain.Enums;
using BuildAndHire.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.PaymentsDto
{
    public class PaymentsDto
    {
        public Guid PaymentId { get; set; }

        public Guid JobId { get; set; }

        public Jobs Job { get; set; } = null!;

        public Guid CustomerId { get; set; }

        public Customer Customer { get; set; } = null!;

        public decimal Amount { get; set; }

        public PaymentMethod PaymentMethod { get; set; }

        public PaymentEnum Status { get; set; }

        public DateTime PaymentDate { get; set; }

        public string? TransactionReference { get; set; }
    }
}
