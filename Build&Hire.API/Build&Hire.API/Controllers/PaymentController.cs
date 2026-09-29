using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Build_Hire.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _service;

        public PaymentController(IPaymentService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllpayments()
        {
            var payment = await _service.GetAllPaymentsAsync();

            return Ok(payment);
        }

        [HttpGet("{Id}")]
        public async Task<IActionResult> GetPaymentById(Guid Id)
        {
            var payment = await _service.GetPaymentsByIdAsync(Id);

            return Ok(payment);
        }

        [HttpPost]
        public async Task<IActionResult>MakePayments(PayPaymentsDto dto)
        {
            var pay = await _service.CompletePaymentAsync(dto);

            return CreatedAtAction(nameof(GetPaymentById), new { Id = pay.PaymentId }, pay);
        }

        [HttpPut]
        public async Task<IActionResult>PaymentResponse(Guid Id, PaymentResponseDto dto)
        {
            var payresponse = await _service.PaymentResponseAsync(Id, dto);

            return Ok(payresponse);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult>DeletePaymentHistory(Guid id)
        {
            var delete = await _service.DeletePaymentHistoryAsync(id);
            return Ok(delete);
        }
    }
}
