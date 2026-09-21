using Microsoft.AspNetCore.Authorization;
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

        /*
         * All authenticated users can view jobs.
         *
         * This supports the marketplace/customer/company
         * browsing flow while we defer ownership checks
         * to the later security pass.
         */
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllJobs()
        {
            var jobs =
                await _service.GetAllJobsAsync();

            return Ok(jobs);
        }

        /*
         * All authenticated users can view a specific job.
         */
        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> GetJobsById(
            Guid id)
        {
            var job =
                await _service.GetJobByIdAsync(id);

            if (job == null)
            {
                return NotFound(
                    "Job not found.");
            }

            return Ok(job);
        }

        /*
         * Only Customers can create jobs.
         */
        [HttpPost]
        [Authorize(Roles = nameof(AccountType.Customer))]
        public async Task<IActionResult> RegisterJob(
            RegisterJobDto dto)
        {
            var job =
                await _service.RegisterJobAsync(dto);

            return CreatedAtAction(
                nameof(GetJobsById),
                new { id = job.JobId },
                job);
        }

        /*
         * Companies manage jobs.
         *
         * Admin and SuperAdmin can also update jobs
         * for administrative purposes.
         *
         * SuperAdmin uses the AdminEnums.SuperAdmin
         * role through the JWT.
         */
        [HttpPut("{id:guid}")]
        [Authorize(
            Roles =
                nameof(AccountType.Company) +
                "," +
                nameof(AdminEnums.Admin) +
                "," +
                nameof(AdminEnums.SuperAdmin)
        )]
        public async Task<IActionResult> UpdateJobDetails(
            Guid id,
            UpdateJobDetailsDto dto)
        {
            var job =
                await _service.UpdateJobDetailsAsync(
                    id,
                    dto);

            if (job == null)
            {
                return NotFound(
                    "Job not found.");
            }

            return Ok(job);
        }

        /*
         * Customers can cancel jobs.
         *
         * Admin and SuperAdmin can also remove jobs
         * administratively.
         */
        [HttpDelete("{id:guid}")]
        [Authorize(
            Roles =
                nameof(AccountType.Customer) +
                "," +
                nameof(AdminEnums.Admin) +
                "," +
                nameof(AdminEnums.SuperAdmin)
        )]
        public async Task<IActionResult> DeleteJob(
            Guid id)
        {
            var result =
                await _service.DeleteJobAsync(id);

            if (result == null)
            {
                return NotFound(
                    "Job not found.");
            }

            return Ok(result);
        }
    }
}