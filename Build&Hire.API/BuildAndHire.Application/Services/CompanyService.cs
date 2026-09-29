using BuildAndHire.Application.DTOs.CompanyDto;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Net.NetworkInformation;
using System.Text;

namespace BuildAndHire.Application.Services
{
    public class CompanyService : ICompanyService
    {
        private readonly ICompanyRepository _repository;
        private readonly IPasswordService _passwordService;

        public CompanyService(
            ICompanyRepository repository,
            IPasswordService passwordService)
        {
            _repository = repository;
            _passwordService = passwordService;
        }
        public async Task<IEnumerable<CompanyDto>> GetAllCompaniesAsync()
        {
            var companies = await _repository.GetAllCompanies();

            return companies.Select(c=> new CompanyDto
            {
                CompanyId = c.CompanyId,
                CompanyName = c.CompanyName,
                CompanyEmail = c.CompanyEmail,
                PasswordHash = c.PasswordHash,
                address = c.address,
                Status = c.Status,
                account = c.account,
                RegistrationNumber = c.RegistrationNumber,
                TaxNumber = c.TaxNumber,
                
            });
        }

        public async Task<CompanyDto> GetCompanyByIdAsync(Guid Id)
        {
            var companies = await _repository.GetCompamiesById(Id);

            if (companies == null) return null;

            return new CompanyDto
            {
                CompanyId = companies.CompanyId,
                CompanyName = companies.CompanyName,
                CompanyEmail = companies.CompanyEmail,
                PasswordHash = companies.PasswordHash,
                address = companies.address,
                Status = companies.Status,
                account = companies.account,
                RegistrationNumber = companies.RegistrationNumber,
                TaxNumber = companies.TaxNumber,

            };
        }

        public async Task<RegisterCompanyDto> RegisterCompanyAsync(
        RegisterCompanyDto dto)
        {
            var newCompany = new Companies
            {
                CompanyName = dto.CompanyName,
                CompanyEmail = dto.CompanyEmail,

                PasswordHash = _passwordService.HashPassword(
                    dto.PasswordHash),
                account = dto.account,
                RegistrationNumber = dto.RegistrationNumber,
                TaxNumber = dto.TaxNumber,
                address = dto.address
            };

            var savedCompany =
                await _repository.RegisterCompany(newCompany);

            return new RegisterCompanyDto
            {
                CompanyName = savedCompany.CompanyName,
                CompanyEmail = savedCompany.CompanyEmail,
                RegistrationNumber = savedCompany.RegistrationNumber,
                TaxNumber = savedCompany.TaxNumber,
                account = savedCompany.account,
                address = savedCompany.address
            };
        }

        public async Task<UpdateCompanyDto> UpdateCompanyAsync(Guid Id, UpdateCompanyDto dto)
        {
            var UpdateCompany = await _repository.GetCompamiesById(Id);
            if (UpdateCompany == null) return null;


            UpdateCompany.CompanyName = dto.CompanyName;
            UpdateCompany.CompanyEmail = dto.CompanyEmail;
            UpdateCompany.address = dto.address;
            UpdateCompany.Status = dto.Status;
            UpdateCompany.RegistrationNumber = dto.RegistrationNumber;
            UpdateCompany.TaxNumber = dto.TaxNumber;

            var update = await _repository.UpdateCompanyDto(UpdateCompany);

            return new UpdateCompanyDto
            {
                CompanyName = update.CompanyName,
                CompanyEmail = update.CompanyEmail,
                address = update.address,
               Status = update.Status,
                RegistrationNumber = update.RegistrationNumber,
               TaxNumber = update.TaxNumber,
            };



        }
        public async Task<string> DeleteCompanyAsync(Guid Id)
        {
            return await _repository.DeleteCompanyAccount(Id);
        }


    }
}
