using BuildAndHire.Application.DTOs.CustomerDto;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _repo;

        public CustomerService(ICustomerRepository repo)
        {
            _repo = repo;
        }
        public async Task<IEnumerable<CustomerDto>> GetAllCustomersAsync()
        {
            var customers = await _repo.GetAllCustomers();

            return customers.Select(c => new CustomerDto
            {
                CustomerId = c.CustomerId,
                CustomerName = c.CustomerName,
                Password = c.Password,
                Email = c.Email,
                Status = c.Status,
                address = c.address,
            });
        }

        public async Task<CustomerDto> GetCustomersByIdAsync(Guid Id)
        {
            var customer = await _repo.GetCustomerById(Id);

            return new CustomerDto
            {
                CustomerId = customer.CustomerId,
                CustomerName = customer.CustomerName,
                Password = customer.Password,
                Email = customer.Email,
                Status = customer.Status,
                address = customer.address,
            };
        }
        public async Task<CreateCustomerDto> AddCustomerAsync(CreateCustomerDto dto)
        {
            var newCustomer = new Customer
            {
                CustomerName = dto.CustomerName,
                Email = dto.Email,
                Status = dto.Status,
                address = dto.address,
                Password = dto.Password,

            };

            var customer = await _repo.CreateCustomerAccount(newCustomer);
            return new CreateCustomerDto
            {
                CustomerName = customer.CustomerName,
                Email = customer.Email,
                Status = customer.Status,
                address = customer.address,
                Password = customer.Password,
            };
        }

        public async Task<string> DeleteCustomerAccountAsync(Guid Id)
        {
            return await _repo.DeleteCustomerAccount(Id);
        }
        public async Task<UpdateCustomerDto> UpdateCustomerDto(Guid Id,UpdateCustomerDto dto)
        {
            var getCustomer = await _repo.GetCustomerById(Id);

            if (getCustomer == null) return null;

            getCustomer.CustomerName = dto.CustomerName;
            getCustomer.Email = dto.Email;
            getCustomer.Password = dto.Password;
            getCustomer.Status = dto.Status;
            getCustomer.address = dto.Address;

            var update = await _repo.UpdateCustomer(getCustomer);

            return new UpdateCustomerDto
            {
                CustomerName = update.CustomerName,
                Email = update.Email,
                Password = update.Password,
                Status = update.Status,
                Address = update.address
            };
            
        }

       
    }
}
