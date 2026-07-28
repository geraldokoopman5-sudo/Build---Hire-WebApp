using BuildAndHire.Application.DTOs.CompanyDto;
using BuildAndHire.Application.DTOs.PaymentsDto;
using BuildAndHire.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Interfaces.Repository
{
    public interface IPayementRepository
    {
        Task<IEnumerable<Payment>> GetAllPaymentsAsync();
        Task<Payment> GetPaymentsByIdAsync(Guid Id);
        Task<Payment> CompletePaymentAsync(Payment dto);
        Task<Payment> PaymentResponseAsync(Payment Id);
        Task<string> DeletePaymentHistoryAsync(Guid Id);
    }
}
