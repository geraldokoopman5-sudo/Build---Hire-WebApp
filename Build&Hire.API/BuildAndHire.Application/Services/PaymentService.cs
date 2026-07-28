using BuildAndHire.Application.DTOs.CompanyDto;
using BuildAndHire.Application.DTOs.PaymentsDto;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPayementRepository _repo;
        public PaymentService(IPayementRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<PaymentsDto>> GetAllPaymentsAsync()
        {
            var getpayment = await _repo.GetAllPaymentsAsync();

            return getpayment.Select(p => new PaymentsDto
            {
                PaymentId = p.PaymentId,
                PaymentDate = p.PaymentDate,
                JobId = p.JobId,
                CustomerId = p.CustomerId,
                Amount = p.Amount,
                PaymentMethod = p.PaymentMethod,
                Status = p.Status,
                TransactionReference = p.TransactionReference,
            });
        }

        public async Task<PaymentsDto> GetPaymentsByIdAsync(Guid Id)
        {
            var payments = await _repo.GetPaymentsByIdAsync(Id);
            if (payments == null) throw new KeyNotFoundException("Payment not found");

            return new PaymentsDto
            {
                PaymentId = payments.PaymentId,
                PaymentDate = payments.PaymentDate,
                JobId = payments.JobId,
                CustomerId = payments.JobId,
                Amount = payments.Amount,
                PaymentMethod = payments.PaymentMethod,
                Status = payments.Status,
                TransactionReference = payments.TransactionReference,

            };
        }

        public async Task<PayPaymentsDto> CompletePaymentAsync(PayPaymentsDto dto)
        {
            var pay = new Payment
            {
                PaymentId = dto.PaymentId,
                PaymentMethod = dto.PaymentMethod,
                JobId = dto.JobId,
                CustomerId = dto.CustomerId,
                Amount = dto.Amount,
                Status = dto.Status,
                TransactionReference = dto.TransactionReference,
            };

            var payment = await _repo.CompletePaymentAsync(pay);

            return new PayPaymentsDto
            {
                PaymentId = payment.PaymentId,
                PaymentMethod = payment.PaymentMethod,
                JobId = payment.JobId,
                CustomerId = payment.CustomerId,
                Amount = payment.Amount,
                Status = payment.Status,
                TransactionReference = payment.TransactionReference,
            };

        }

        public async Task<string> DeletePaymentHistoryAsync(Guid Id)
        {
            return await _repo.DeletePaymentHistoryAsync(Id);
        }

        public async Task<PaymentResponseDto> PaymentResponseAsync(Guid Id, PaymentResponseDto dto)
        {
            var payed = await _repo.GetPaymentsByIdAsync(Id);
            if (payed == null) throw new KeyNotFoundException("Payment not found");

            payed.Status = dto.Status;

            var pay = await _repo.PaymentResponseAsync(payed);

            return new PaymentResponseDto
            {
                Status = pay.Status,
            };

        }
    }


}
