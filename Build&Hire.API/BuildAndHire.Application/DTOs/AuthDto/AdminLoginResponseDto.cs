using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.AuthDto
{
    public class AdminLoginResponseDto : LoginresponseDto
    {
        public Guid AdminId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public AccountStatus Status { get; set; }

        public AdminEnums AdminRole { get; set; }
    }
}
