using BuildAndHire.Application.DTOs.CustomerDto;
using BuildAndHire.Domain.Models;

namespace BuildAndHire.Application.Interfaces.Repositories;

public interface ICustomerRepository
{
    Task<IEnumerable<CustomerDto>> GetAllCustomers();
    Task<CustomerDto> GetCustomerById(Guid Id);
    Task<CreateCustomerDto> CreateCustomerAccount(CustomerDto dto);
    Task<UpdateCustomerDto> UpdateCustomer(UpdateCustomerDto dto);
    Task<string> DeleteCustomerAccount(Guid id);
}