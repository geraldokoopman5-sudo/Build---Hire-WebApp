using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Interfaces.Services
{
    public interface IPasswordService
    {
        string HashPassword(string password);

        bool VerifyPassword(
            string password,
            string passwordHash);
    }
}
