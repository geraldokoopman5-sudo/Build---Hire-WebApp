using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Build_Hire.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkersController : ControllerBase
    {
        private readonly IWorkerService _service;

        public WorkersController(IWorkerService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllWorkers()
        {
            var worker = await _service.GetAllWorkersAsync();

            return Ok(worker);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetWorkersById(Guid Id)
        {
            var worker = await _service.GetWorkersByIdAsync(Id);

            return Ok(worker);
        }

        [HttpPost]
        public async Task<IActionResult>AddWorker(AddWorkerDto dto)
        {
            var hire = await _service.AddWorkerAsync(dto);

            return CreatedAtAction(nameof(GetWorkersById), new { id = hire.WorkerId }, hire );
        }

        [HttpPut]
        public async Task<IActionResult>EditWorkerDetails(Guid id, UpdateWorkerDto dto)
        {
            var update = await _service.UpdateWorkerAsync(id, dto);

            return Ok(update);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult>DeleteWorkerDetails(Guid id)
        {
            var delete = await _service.DeleteWorkerAsync(id);

            return Ok(delete);
        }
    }
}
