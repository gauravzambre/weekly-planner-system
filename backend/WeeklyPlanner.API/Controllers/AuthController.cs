using Microsoft.AspNetCore.Mvc;
using WeeklyPlanner.API.DTOs;

namespace WeeklyPlanner.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        // POST api/auth/login
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            // Authentication not implemented yet
            return StatusCode(501, "Login endpoint not implemented");
        }

        // POST api/auth/refresh
        [HttpPost("refresh")]
        public IActionResult Refresh([FromBody] RefreshDto dto)
        {
            // Token refresh not implemented yet
            return StatusCode(501, "Token refresh not implemented");
        }

        // POST api/auth/logout
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Logout not implemented yet
            return StatusCode(501, "Logout endpoint not implemented");
        }
    }
}