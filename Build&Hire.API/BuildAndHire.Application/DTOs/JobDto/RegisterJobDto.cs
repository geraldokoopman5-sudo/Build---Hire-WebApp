using BuildAndHire.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.JobDto
{
    public class RegisterJobDto
    {
        public Guid JobId { get; set; }

        public Guid CompanyId { get; set; }

        public Guid CustomerId { get; set; }

        public string JobDescription { get; set; } = string.Empty;
        public decimal DailyRate { get; set; }

        public int DaysWorking { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public JobEnum Status { get; set; }

        public PaymentMethod? PayingMethod { get; set; }

        public Address? address { get; set; }
    }
}
