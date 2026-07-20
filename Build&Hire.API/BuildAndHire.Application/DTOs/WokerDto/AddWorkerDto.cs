using BuildAndHire.Domain.Enums;
using BuildAndHire.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.WokerDto
{
    public class AddWorkerDto
    {
        public Guid WorkerId { get; set; }

        public string WorkerFirstName { get; set; } = string.Empty;

        public string WorkerLastNAme { get; set; } = string.Empty;

        public AccountStatus WorkerStatus { get; set; }

        public Guid CompanyId { get; set; }

        public Companies? ResidingCompany { get; set; }

    }
}
