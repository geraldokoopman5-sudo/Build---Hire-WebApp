using BuildAndHire.Application.DTOs.CompanyDto;

namespace BuildAndHire.Application.Interfaces.Repositories;

public interface ICompanyRepository
{
    Task<IEnumerable<CompanyDto>> GetAllCompanies();
    Task<CompanyDto> GetCompamiesById(Guid id);
    Task<RegisterCompanyDto> RegisterCompany(RegisterCompanyDto dto);
    Task<UpdateCompanyDto> UpdateCompanyDto(UpdateCompanyDto dto);
    Task<string>DeleteCompanyAccount(Guid id);

}
