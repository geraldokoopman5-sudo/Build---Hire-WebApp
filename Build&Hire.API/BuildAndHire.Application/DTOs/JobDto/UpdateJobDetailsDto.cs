using BuildAndHire.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.JobDto
{
    public class UpdateJobDetailsDto
    {
        public decimal DailyRate { get; set; }

        public DateTime EndDate { get; set; }

        public JobStatus Status { get; set; }

        public PaymentMethod? PayingMethod { get; set; }

    }
}
