using Microsoft.AspNetCore.Mvc;

namespace BuidAndHireAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EquuipmentControllerController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok();
    }
}
