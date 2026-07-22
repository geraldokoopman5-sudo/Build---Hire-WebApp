using BuildAndHire.Application.DTOs.CompanyDto;
using BuildAndHire.Application.DTOs.PaymentsDto;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Interfaces.Services
{
    public interface IPaymentService
    {
        Task<IEnumerable<PaymentsDto>> GetAllPaymentsAsync();
        Task<CompanyDto> GetPaymentsByIdAsync(Guid Id);
        Task<PayPaymentsDto>CompletePaymentAsync(PaymentsDto dto);
        Task<PaymentResponseDto> PaymentResponseAsync(Guid Id);
        Task<string> DeletePaymentHistoryAsync(Guid Id);

    }
}
