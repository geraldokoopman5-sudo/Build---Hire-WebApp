using BuildAndHire.Domain.Enums;
using BuildAndHire.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.DTOs.PaymentsDto
{
    public class PaymentResponseDto
    {
        public PaymentEnum Status { get; set; }

    }
}
