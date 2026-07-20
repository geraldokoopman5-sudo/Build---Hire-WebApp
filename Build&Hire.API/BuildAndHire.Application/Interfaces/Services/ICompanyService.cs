using BuildAndHire.Application.DTOs.CompanyDto;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Interfaces.Services
{
   public interface ICompanyService
    {   
        Task<IEnumerable<CompanyDto>> GetAllCompaniesAsync();
        Task<CompanyDto> GetCompanyByIdAsync(Guid Id);
        Task<RegisterCompanyDto> RegisterCompanyAsync(RegisterCompanyDto dto);
        Task<UpdateCompanyDto> UpdateCompanyAsync(UpdateCompanyDto dto);
        Task <string>DeleteCompanyAsync(Guid Id);
    }
}
