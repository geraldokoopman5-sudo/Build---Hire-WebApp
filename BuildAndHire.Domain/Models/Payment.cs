using BuildAndHire.Domain.Enums;
namespace BuildAndHire.Domain.Models;

   public class Payment
{
    public Guid PaymentId { get; set; }

    public Guid JobId { get; set; }

    public Jobs Job { get; set; } = null!;

    public Guid CustomerId { get; set; }

    public Customer Customer { get; set; } = null!;

    public decimal Amount { get; set; }

    public Paymentmethod PaymentMethod { get; set; }

    public PaymentStatus Status { get; set; }

    public DateTime PaymentDate { get; set; }

    public string? TransactionReference { get; set; }
}
