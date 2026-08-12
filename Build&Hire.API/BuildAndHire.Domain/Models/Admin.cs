using BuildAndHire.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Domain.Models
{
    public class Admin
    {
        public Guid AdminId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;
        public string passWord { get; set; } = string.Empty;

        public AccountStatus Status { get; set; } = AccountStatus.Pending;

        public AdminEnums AdminRole { get; set; } = AdminEnums.Admin;
    }
}
