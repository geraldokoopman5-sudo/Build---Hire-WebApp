using BuildAndHire.Application.DTOs.AuthDto;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BuildAndHire.Infrastructure.Authentication
{
    public class JwtService : IJwtService
    {
        private readonly BuildAndHireDbContext _context;
        private readonly IConfiguration _config;
        private readonly IPasswordService _passwordService;

        public JwtService(
     BuildAndHireDbContext context,
     IConfiguration config,
     IPasswordService passwordService)
        {
            _context = context;
            _config = config;
            _passwordService = passwordService;
        }

        public async Task<LoginresponseDto?> AuthenticateUser(
    LoginRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password))
            {
                return null;
            }

            // Check Company
            var company = await _context.Companies
                .FirstOrDefaultAsync(c =>
                    c.CompanyEmail == dto.Email);

            if (company != null)
            {
                var passwordIsValid = _passwordService.VerifyPassword(
                    dto.Password,
                    company.PasswordHash);

                if (!passwordIsValid)
                {
                    return null;
                }

                var tokenValidityMins =
                    _config.GetValue<int>(
                        "JwtConfig:TokenValidityMins");

                var tokenExpire =
                    DateTime.UtcNow.AddMinutes(tokenValidityMins);

                var accessToken = GenerateToken(
                    company.CompanyId.ToString(),
                    company.CompanyEmail,
                    AccountType.Company,
                    "Company",
                    tokenExpire);

                return new CompanyLoginResponseDto
                {
                    AccessToken = accessToken,

                    ExpiresIn =
                        (int)(tokenExpire - DateTime.UtcNow)
                        .TotalSeconds,

                    AccountType = AccountType.Company,

                    CompanyId = company.CompanyId,

                    CompanyName = company.CompanyName,

                    CompanyEmail = company.CompanyEmail,

                    Status = company.Status,

                    Address = company.address,

                    RegistrationNumber =
                        company.RegistrationNumber,

                    TaxNumber =
                        company.TaxNumber
                };
            }

            var customer = await _context.Customers
                .FirstOrDefaultAsync(c =>
                    c.Email == dto.Email);

            if (customer != null)
            {
                return await AuthenticateCustomer(dto);
            }


            // Check Admin
            var admin = await _context.Admin
                .FirstOrDefaultAsync(a =>
                    a.Email == dto.Email);

            if (admin != null)
            {
                return await AuthenticateAdmin(dto);
            }

            return null;

        }



        private async Task<CustomerLoginResponseDto?> AuthenticateCustomer(
    LoginRequestDto dto)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Email == dto.Email);

            if (customer == null)
            {
                return null;
            }

            var passwordIsValid = _passwordService.VerifyPassword(
             dto.Password,
                customer.PasswordHash);

            if (!passwordIsValid)
            {
                return null;
            }

            var tokenValidityMins =
                _config.GetValue<int>(
                    "JwtConfig:TokenValidityMins");

            var tokenExpire =
                DateTime.UtcNow.AddMinutes(tokenValidityMins);

            var accessToken = GenerateToken(
                customer.CustomerId.ToString(),
                customer.Email,
                AccountType.Customer,
                "Customer",
                tokenExpire);

            return new CustomerLoginResponseDto
            {
                AccessToken = accessToken,

                ExpiresIn =
                    (int)(tokenExpire - DateTime.UtcNow)
                    .TotalSeconds,

                AccountType = AccountType.Customer,

                CustomerId = customer.CustomerId,

                CustomerName = customer.CustomerName,

                Email = customer.Email,

                Status = customer.Status,

                Address = customer.address
            };

       
        }

        private string GenerateToken(
            string accountId,
            string email,
            AccountType accountType,
            string role,
            DateTime tokenExpire)
        {
            var issuer =
                _config["JwtConfig:Issuer"];

            var audience =
                _config["JwtConfig:Audience"];

            var key =
                _config["JwtConfig:Key"];

            if (string.IsNullOrWhiteSpace(key))
            {
                throw new InvalidOperationException(
                    "JWT signing key is not configured.");
            }

            var claims = new List<Claim>
            {
                new Claim(
                    JwtRegisteredClaimNames.Sub,
                    accountId),

                new Claim(
                    JwtRegisteredClaimNames.Email,
                    email),

                new Claim(
                    "AccountType",
                    accountType.ToString()),

                new Claim(
                    ClaimTypes.Role,
                    role)
            };

            var tokenDescriptor =
                new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),

                    Expires = tokenExpire,

                    Issuer = issuer,

                    Audience = audience,

                    SigningCredentials =
                        new SigningCredentials(
                            new SymmetricSecurityKey(
                                Encoding.UTF8.GetBytes(key)),
                            SecurityAlgorithms.HmacSha512Signature)
                };

            var tokenHandler =
                new JwtSecurityTokenHandler();

            var securityToken =
                tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(
                securityToken);
        }

        private async Task<AdminLoginResponseDto?> AuthenticateAdmin(
      LoginRequestDto dto)
        {
            var admin = await _context.Admin
                .FirstOrDefaultAsync(a => a.Email == dto.Email);

            if (admin == null)
            {
                return null;
            }

            var passwordIsValid = _passwordService.VerifyPassword(
                dto.Password,
                admin.PasswordHash);

            if (!passwordIsValid)
            {
                return null;
            }

            var tokenValidityMins =
                _config.GetValue<int>(
                    "JwtConfig:TokenValidityMins");

            var tokenExpire =
                DateTime.UtcNow.AddMinutes(tokenValidityMins);

            var accessToken = GenerateToken(
                admin.AdminId.ToString(),
                admin.Email,
                AccountType.Admin,
                admin.AdminRole.ToString(),
                tokenExpire);

            return new AdminLoginResponseDto
            {
                AccessToken = accessToken,

                ExpiresIn =
                    (int)(tokenExpire - DateTime.UtcNow)
                    .TotalSeconds,

                AccountType = AccountType.Admin,

                AdminId = admin.AdminId,

                UserName = admin.UserName,

                Status = admin.Status,

                AdminRole = admin.AdminRole
            };
        }
    }
    
}
