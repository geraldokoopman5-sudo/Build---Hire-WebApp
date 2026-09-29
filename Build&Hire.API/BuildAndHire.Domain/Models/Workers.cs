using BuildAndHire.Domain.ValueObjects;
using BuildAndHire.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Domain.Models
{
    public class Workers
    {
        public Guid WorkerId { get; set; }

        public string WorkerFirstName { get; set; } = string.Empty;

        public string WorkerLastNAme { get; set; } = string.Empty;

        public AccountStatus WorkerStatus { get; set; }//will be used for now until I decide I want to make a different set of enums

        //For initializing 
        public Guid CompanyId { get; set; }

        public Companies? ResidingCompany { get; set; }

        public Guid JobId { get; set; }

        public Jobs? Job { get; set; }
    }
}
