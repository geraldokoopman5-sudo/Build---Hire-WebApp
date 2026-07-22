using BuildAndHire.Application.Interfaces.Repositories;
using BuildAndHire.Domain.Models;
using BuildAndHire.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Infrastructure.Repositories
{
    public class CompanyRepository : ICompanyRepository
    {
        private readonly BuildAndHireDbContext _context;

        public CompanyRepository(BuildAndHireDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Companies>> GetAllCompanies()
        {
            return await _context.Companies.Include(w => w.Workers).ToListAsync();
        }

        public async Task<Companies> GetCompamiesById(Guid id)
        {
            Companies? companies = await _context.Companies.FirstOrDefaultAsync(i => i.CompanyId == id);

            if (companies == null)
            {
                return null;

            }
            else
            {
                return companies;
            }
        }

        public async Task<Companies> RegisterCompany(Companies dto)
        {
            await _context.Companies.AddAsync(dto);
            await _context.SaveChangesAsync();

            return dto;
        }

        public async Task<Companies> UpdateCompanyDto(Companies dto)
        {
            var company = await _context.Companies.FindAsync(dto.CompanyId);

            if(company == null)
                return null;

            company.CompanyName = dto.CompanyName;
            company.Password = dto.Password;
            company.address = dto.address;
            company.Status = dto.Status;

            await _context.SaveChangesAsync();
            return company;

        }

        public async Task<string> DeleteCompanyAccount(Guid id)
        {
            var company = await _context.Companies.FindAsync(id);

            if (company == null) return null;

            _context.Companies.Remove(company);
            await _context.SaveChangesAsync();

            return $"Comapny {company.CompanyName} was deleted successfully";
        }


    }

}
