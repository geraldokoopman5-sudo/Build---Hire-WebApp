using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Interfaces.Services
{

    public interface IJwtService
    {
        Task<LoginresponseDto?> AuthenticateUser(
            LoginRequestDto dto);
    }

}