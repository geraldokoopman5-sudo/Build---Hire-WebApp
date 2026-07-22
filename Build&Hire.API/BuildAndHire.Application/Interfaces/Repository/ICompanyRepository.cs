using BuildAndHire.Application.DTOs.CompanyDto;
using BuildAndHire.Domain.Models;

namespace BuildAndHire.Application.Interfaces.Repositories;

public interface ICompanyRepository
{
    Task<IEnumerable<Companies>> GetAllCompanies();
    Task<Companies> GetCompamiesById(Guid id);
    Task<Companies> RegisterCompany(Companies dto);
    Task<Companies> UpdateCompanyDto(Companies dto);
    Task<string> DeleteCompanyAccount(Guid id);

}