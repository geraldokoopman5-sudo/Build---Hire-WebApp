using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Build_Hire.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobsController : ControllerBase
    {
        private readonly IJobService _service;

        public JobsController(IJobService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllJobs()
        {
            var jobs = await _service.GetAllJobsAsync();

            return Ok(jobs);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetJobsById(Guid id)
        {
            var jobs = await _service.GetJobByIdAsync(id);
            //if (id == null) return NotFound("No Jobs were found, wrong Id fn!!");

            return Ok(jobs);
        }

        [HttpPost]
        public async Task<IActionResult> Registerjob(RegisterJobDto dto)
        {
            var jobs = await _service.RegisterJobAsync(dto);

            return CreatedAtAction(nameof(GetJobsById), new { id = jobs.JobId }, jobs);
        }

        [HttpPut]
        public async Task<IActionResult> UpdatejobDetails(Guid id, UpdateJobDetailsDto dto)
        {
            var jobs = await _service.UpdateJobDetailsAsync(id, dto);
            return Ok(jobs);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult>DeleteJob(Guid id)
        {
            var delete = await _service.DeleteJobAsync(id);
            return Ok(delete);
        }
    }
}
