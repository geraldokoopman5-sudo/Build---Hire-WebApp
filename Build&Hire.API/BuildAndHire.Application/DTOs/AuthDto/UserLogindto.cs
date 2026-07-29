using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.AuthDto
{
    public abstract class UserLogindto
    {
        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;
    }
}
