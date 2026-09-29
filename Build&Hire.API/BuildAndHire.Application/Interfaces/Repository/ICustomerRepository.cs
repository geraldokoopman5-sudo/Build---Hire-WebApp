using BuildAndHire.Application.DTOs.CustomerDto;
using BuildAndHire.Domain.Models;

namespace BuildAndHire.Application.Interfaces.Repositories;

public interface ICustomerRepository
{
    Task<IEnumerable<Customer>> GetAllCustomers();
    Task<Customer> GetCustomerById(Guid Id);
    Task<Customer> CreateCustomerAccount(Customer customer);
    Task<Customer> UpdateCustomer(Customer customer);
    Task<string> DeleteCustomerAccount(Guid id);
}