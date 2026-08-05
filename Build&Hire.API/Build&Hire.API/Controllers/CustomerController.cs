using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Build_Hire.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _service;

        public CustomerController(ICustomerService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCustomerAccounts()
        {
            var customers = await _service.GetAllCustomersAsync();
            return Ok(customers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCustomersById(Guid id)
        {
            var customer = await _service.GetCustomersByIdAsync(id);

            if (customer == null) return NotFound("Customer not found, wrong Id");

            return Ok(customer);
        }

        [HttpPost]
        public async Task<IActionResult> AddNewCustomer(CreateCustomerDto dto)
        {
            var customer = await _service.AddCustomerAsync(dto);

            return CreatedAtAction(nameof(GetCustomersById), new { id = customer.CustomerId }, customer);
              
        }

        [HttpPut("{id}")]
        public async Task<IActionResult>UpdateCustomerDetails(Guid id, UpdateCustomerDto dto)
        {
            var update = await _service.UpdateCustomerDto(id, dto);

            return Ok(update);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult>DeleteCustomerAccount(Guid id)
        {
            var deleted = await _service.DeleteCustomerAccountAsync(id);

            return Ok(deleted);
        }
    }
}
