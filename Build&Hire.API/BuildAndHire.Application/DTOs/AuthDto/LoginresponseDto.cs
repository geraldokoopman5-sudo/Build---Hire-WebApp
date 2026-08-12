using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.AuthDto
{
    public class LoginresponseDto
    {
        public class CustomerLoginresponseDto
        {
            public Guid CustomerId { get; set; }

            public string CustomerName { get; set; } = string.Empty;

            public string Password { get; set; } = string.Empty;

            public string Email { get; set; } = string.Empty;

            public Guid? JobId { get; set; }
            public Jobs? jobs { get; set; }

            public AccountStatus Status { get; set; }

            public Address? address { get; set; }
        }

        public class CompanyLoginresponseDto
        {
            public Guid CompanyId { get; set; }
            public string CompanyName { get; set; } = string.Empty;
            public string CompanyEmail { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public Address? address { get; set; }
            public AccountStatus Status { get; set; }
            public Guid? JobId { get; set; }
            public Jobs? jobs { get; set; }
            public string RegistrationNumber { get; set; } = string.Empty;
            public string TaxNumber { get; set; } = string.Empty;
        }

        public class AdminLoginresponse
        {
            public Guid AdminId { get; set; }

            public string UserName { get; set; } = string.Empty;

            public string passWord { get; set; } = string.Empty;

            public AccountStatus Status { get; set; } = AccountStatus.Pending;

            public AdminEnums AdminRole { get; set; } = AdminEnums.Admin;
        }
    }
}
