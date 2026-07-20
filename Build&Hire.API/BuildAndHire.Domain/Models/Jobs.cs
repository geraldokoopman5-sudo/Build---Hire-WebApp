using BuildAndHire.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Domain.Models
{
    public class Jobs
    {
        public Guid JobId { get; set; }

        public Guid CompanyId { get; set; }
        public Companies? companies { get; set; }

        public Guid CustomerId { get; set; }
        public Customer? customer { get; set; }

        public string JobDescription { get; set; } = string.Empty;

        public int DaysWorking { get; set; }

        public decimal DailyRate { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public JobStatus Status { get; set; }

        public ICollection<Workers> Workers { get; set; } = new List<Workers>();

        public Address? address { get; set; }
    }
}
