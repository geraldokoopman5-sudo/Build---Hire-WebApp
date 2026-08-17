using BuildAndHire.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.CustomerDto
{
    public class UpdateCustomerDto
    {
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public AccountStatus Status { get; set; }

        public Address? Address { get; set; }

    }
}
