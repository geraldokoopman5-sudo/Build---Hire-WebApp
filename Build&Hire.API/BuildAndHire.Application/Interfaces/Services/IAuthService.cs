using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Interfaces.Services
{
    public interface IAuthService
    {
        Task<CustomerDto> CustomerLoginAsync(LoginRequestDto dto);
        Task<CompanyDto> CompanyLoginAsync(LoginRequestDto dto);
        Task<AdminDto> AdminLoginAsync(LoginRequestDto dto);
        
    }
}
