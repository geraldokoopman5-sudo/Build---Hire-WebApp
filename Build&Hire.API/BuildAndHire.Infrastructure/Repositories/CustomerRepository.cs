using BuildAndHire.Application.DTOs.CustomerDto;
using BuildAndHire.Application.Interfaces.Repositories;
using BuildAndHire.Domain.Models;
using BuildAndHire.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Infrastructure.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly BuildAndHireDbContext _context;

        public CustomerRepository(BuildAndHireDbContext context) 
        { 
            _context = context;
        }

        public async Task<IEnumerable<Customer>> GetAllCustomers()
        {
            return await _context.Customers.ToListAsync();
            
        }

        public async Task<Customer?> GetCustomerById(Guid Id)
        {
            return await _context.Customers.FirstOrDefaultAsync(c => c.CustomerId == Id);

        }

        public async Task<Customer> CreateCustomerAccount(Customer customer)
        {
            await _context.Customers.AddAsync(customer);
            await _context.SaveChangesAsync();
            
            return customer;
        }

        public async Task<Customer> UpdateCustomer(Customer customer)
        {
            var accountExist = await _context.Customers.FindAsync(customer.CustomerId);
            if (accountExist == null)
                return null;

            accountExist.CustomerName = customer.CustomerName;
            accountExist.Email = customer.Email;
            accountExist.Status = customer.Status;
            accountExist.Payments = customer.Payments;
            accountExist.address = customer.address;
            accountExist.Password = customer.Password;

            await _context.SaveChangesAsync();
            return accountExist;
        }

        public async Task<string> DeleteCustomerAccount(Guid id)
        {
            var customer = await _context.Customers.FindAsync(id);
            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return $"{customer.CustomerName} deleted";
                
        }

    }
}
