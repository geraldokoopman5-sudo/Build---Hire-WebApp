using System.ComponentModel.Design;
using BuildAndHire.Application.DTOs.CustomerDto;

namespace BuildAndHire.Application.Interfaces.Services;

public interface ICustomerService
{
    Task<IEnumerable<CustomerDto>> GetAllCustomersAsync();
    Task<CustomerDto> GetCustomersByIdAsync(Guid Id);
    Task<CreateCustomerDto> AddCustomerAsync(CreateCustomerDto dto);
    Task<UpdateCustomerDto> UpdateCustomerDto(UpdateCustomerDto dto);
    Task<string>DeleteCustomerAccountAsync(Guid Id);
}
