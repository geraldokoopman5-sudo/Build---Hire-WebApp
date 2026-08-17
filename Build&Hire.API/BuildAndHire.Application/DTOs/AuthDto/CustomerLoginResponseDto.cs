using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.AuthDto
{
    public class CustomerLoginResponseDto : LoginresponseDto
    {
        public Guid CustomerId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public AccountStatus Status { get; set; }

        public Guid? JobId { get; set; }

        public Jobs? Jobs { get; set; }

        public Address? Address { get; set; }
    }
}
