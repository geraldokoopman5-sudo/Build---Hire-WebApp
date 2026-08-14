using BuildAndHire.Application.DTOs.AuthDto;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BuildAndHire.Infrastructure.Authentication
{
    public class JwtService
    {
        private readonly BuildAndHireDbContext _context;
        private readonly IConfiguration _config;

        public JwtService(BuildAndHireDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<UserLogindto?> AuthenticateUser(UserLogindto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return null;

            var UserEmail = await _context.Companies.FirstOrDefaultAsync(c => c.CompanyEmail == dto.Email);
            if (UserEmail == null) return null;

            var issuer = _config["JwtConfig : Issuer"];
            var audience = _config["JwtConfig : Audience"];
            var key = _config["JwtConfig : 7fK92mQ8xP4vL6tR3nY5wZ1aB9cD8eF2gH7jK4mN6pQ"];
            var tokenmins = _config.GetValue<int>("JwtConfig : TokenValidityMins");
            var tokenExpire = DateTime.UtcNow.AddMinutes(tokenmins);

            var TokenSubject = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]

            {
                new Claim(JwtRegisteredClaimNames.Name, dto.Email)
            }),

            }
        }
    }
}
