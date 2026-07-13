using System.Net.Sockets;
using BuildAndHire.Domain.Enums;
using BuildAndHire.Domain.ValueObjects;

namespace BuildAndHire.Domain.Models;

public class Customer
{
   public Guid CustomerId { get; set; }

   public string CustomerName { get; set; } = string.Empty;

   public string Password { get; set; } = string.Empty;

   public string Email { get; set; } = string.Empty;

   public AccountStatus Status { get; set; }

   public Address? address{ get; set; }
}
