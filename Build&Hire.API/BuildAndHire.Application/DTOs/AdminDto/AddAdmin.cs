using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.AdminDto
{
    public class AddAdmin
    {
        public Guid AdminId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public AdminEnums AdminRole { get; set; } = AdminEnums.Admin;

        public AccountStatus Status { get; set; } = AccountStatus.Pending;
    }
}
