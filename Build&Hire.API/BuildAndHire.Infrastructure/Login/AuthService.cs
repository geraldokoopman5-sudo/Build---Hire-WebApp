//using BuildAndHire.Application.DTOs.AuthDto;
//using BuildAndHire.Application.DTOs.CompanyDto;
//using BuildAndHire.Application.DTOs.CustomerDto;
//using Microsoft.AspNetCore.Identity;
//using System;
//using System.Collections.Generic;
//using System.Text;

//namespace BuildAndHire.Infrastructure.Login
//{
//    internal class AuthService : IAuthService
//    {
//        private readonly ICompanyRepository _companyRepository;
//        private readonly ICustomerRepository _customerRepository;


//        public AuthService(
//        ICompanyRepository companyRepository,
//        ICustomerRepository customerRepository)
//        //IJwtService jwtService,
//        //IPasswordHasher passwordHasher)
//        {
//            _companyRepository = companyRepository;
//            _customerRepository = customerRepository;
//            //_jwtService = jwtService;
//            //_passwordHasher = passwordHasher;
//        }
//    }

//        //public async Task<CompanyDto> CompanyLoginAsync(UserLogindto dto)
//        //{
//        //    var company = await _context.Companies
//        //    .FirstOrDefaultAsync(c => c.CompanyEmail == dto.Email);

//        //    if (company == null)
//        //    {
//        //        throw new UnauthorizedAccessException("Invalid email or password.");
//        //    }


//        //}

//        //public async Task<CustomerDto> CustomerLoginAsync(UserLogindto dto)
//        //{
//        //    var customers = await _context.Customers
//        //    .FirstOrDefaultAsync(c => c.Email == dto.Email);

//        //    if (customers == null)
//        //    {
//        //        throw new UnauthorizedAccessException("Invalid email or password.");
//        //    }
//        }
//    }
//}
