using BuildAndHire.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.CustomerDto
{
    public class CreateCustomerDto
    {

        public string CustomerName { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;


        public Address? address { get; set; }
    }
}

