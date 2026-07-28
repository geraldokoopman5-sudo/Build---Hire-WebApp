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
        Task<PaymentsDto> GetPaymentsByIdAsync(Guid Id);
        Task<PayPaymentsDto>CompletePaymentAsync(PayPaymentsDto dto);
        Task<PaymentResponseDto> PaymentResponseAsync(Guid Id, PaymentResponseDto dto);
        Task<string> DeletePaymentHistoryAsync(Guid Id);

    }
}
