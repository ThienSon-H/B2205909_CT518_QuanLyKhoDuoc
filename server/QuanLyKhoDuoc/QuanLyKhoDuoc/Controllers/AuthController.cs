using QuanLyKhoDuoc.Models;
using QuanLyKhoDuoc.Services;
using Microsoft.AspNetCore.Mvc;

namespace QuanLyKhoDuoc.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var result = await _authService.Register(request);
            return Ok(new { message = result });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.Login(request);
            if (!result.Success)
                return Unauthorized(new { message = result.Message });

            return Ok(new
            {
                success = true,
                username = result.Username,
                isAdmin = result.IsAdmin,
                isActive = result.IsActive
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers([FromQuery] string adminUsername)
        {
            try
            {
                var users = await _authService.GetAllUsers(adminUsername);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("toggle-user")]
        public async Task<IActionResult> ToggleUser([FromQuery] string adminUsername, [FromBody] ToggleUserRequest request)
        {
            var result = await _authService.ToggleUserActive(adminUsername, request.TargetUsername);
            if (result.StartsWith("LỖI"))
                return BadRequest(new { message = result });
            return Ok(new { message = result });
        }
    }
}