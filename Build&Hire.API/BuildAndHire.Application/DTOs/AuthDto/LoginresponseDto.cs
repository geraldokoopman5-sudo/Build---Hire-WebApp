using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.AuthDto
{
    public class LoginresponseDto
    {
        public string AccessToken { get; set; } = string.Empty;

        public int ExpiresIn { get; set; }

        public AccountType AccountType { get; set; }
    }
}
