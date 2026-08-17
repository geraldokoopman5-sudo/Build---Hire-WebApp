using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Build_Hire.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IJwtService _jwtService;

        public AuthController(IJwtService jwtService)
        {
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] LoginRequestDto dto)
        {
            var response = await _jwtService.AuthenticateUser(dto);

            if (response == null)
            {
                return Unauthorized(new
                {
                    Message = "Invalid email or password."
                });
            }

            return Ok(response);
        }
    }
}
