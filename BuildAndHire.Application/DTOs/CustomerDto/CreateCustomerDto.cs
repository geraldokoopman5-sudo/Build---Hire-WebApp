using BuildAndHire.Domain.ValueObjects;
using BuildAndHire.Domain.Enums;
using BuildAndHire.Domain.Models;

namespace BuildAndHire.Application.DTOs.CustomerDto;

public class CreateCustomerDto
{

    public Guid CustomerId { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public Guid? JobId { get; set; }
    public Jobs? jobs { get; set; } 

    public AccountStatus Status { get; set; }

    public Address? address { get; set; }
}
