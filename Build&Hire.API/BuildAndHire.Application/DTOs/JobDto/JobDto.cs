using BuildAndHire.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.JobDto
{
    public class JobDto
    {
        public Guid JobId { get; set; }

        public string CompanyName { get; set; } = string.Empty;

        public Guid CompanyId { get; set; }

        public Guid CustomerId { get; set; }

        public string JobDescription { get; set; } = string.Empty;

        public int DaysWorking { get; set; }

        public decimal Quote { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public JobEnum Status { get; set; }

        public DateTime? AcceptedAt { get; set; }
        public DateTime? QuoteSentAt { get; set; }
        public DateTime? QuoteAcceptedAt { get; set; }

        public PaymentMethod? PayingMethod { get; set; }
        public PaymentEnum? PaymentStatus { get; set; }
        public decimal AmountPaid { get; set; }
        public string? PaymentReference { get; set; }

        public Address? address { get; set; }
    }
}
