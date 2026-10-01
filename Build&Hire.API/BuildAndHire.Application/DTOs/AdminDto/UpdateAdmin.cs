using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.AdminDto
{
    public class UpdateAdmin
    {
        public string? Password { get; set; }
        public AdminEnums AdminRole { get; set; } = AdminEnums.Admin;
        public string Email { get; set; } = string.Empty;
        public AccountStatus Status { get; set; } = AccountStatus.Pending;
    }
}
