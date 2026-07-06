using Microsoft.AspNetCore.Mvc;

namespace BuidAndHireAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompanyControllerController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok();
    }
}
