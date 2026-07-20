using BuildAndHire.Domain.Enums;
using BuildAndHire.Domain.Models;
using BuildAndHire.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.JobDto
{
    public class RegisterJobDto
    {
        public Guid JobId { get; set; }

        public Guid CompanyId { get; set; }
        public Companies? companies { get; set; }

        public Guid CustomerId { get; set; }
        public Customer? customer { get; set; }

        public string JobDescription { get; set; } = string.Empty;

        public int DaysWorking { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public JobStatus Status { get; set; }

        public Paymentmethod? PayingMethod { get; set; }

        public Address? address { get; set; }
    }
}
