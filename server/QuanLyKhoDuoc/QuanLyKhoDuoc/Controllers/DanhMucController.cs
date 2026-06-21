using Microsoft.AspNetCore.Mvc;
using QuanLyKhoDuoc.Services;

namespace QuanLyKhoDuoc.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DanhMucController : ControllerBase
    {
        private readonly DanhMucService _service;
        public DanhMucController(DanhMucService service)
        {
            _service = service;
        }

        // ========== NHÓM THUỐC ==========
        [HttpGet("nhom-thuoc")]
        public async Task<IActionResult> GetAllNhomThuoc([FromQuery] string adminUsername)
        {
            try
            {
                var data = await _service.GetAllNhomThuoc(adminUsername);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("nhom-thuoc")]
        public async Task<IActionResult> InsertNhomThuoc([FromQuery] string adminUsername, [FromBody] NhomThuocInput input)
        {
            var result = await _service.InsertNhomThuoc(adminUsername, input.MaNhom, input.TenNhom);
            if (result.StartsWith("LỖI"))
                return BadRequest(new { message = result });
            return Ok(new { message = result });
        }

        [HttpPut("nhom-thuoc/{maNhom}")]
        public async Task<IActionResult> UpdateNhomThuoc([FromQuery] string adminUsername, string maNhom, [FromBody] NhomThuocInput input)
        {
            var result = await _service.UpdateNhomThuoc(adminUsername, maNhom, input.TenNhom);
            if (result.StartsWith("LỖI"))
                return BadRequest(new { message = result });
            return Ok(new { message = result });
        }

        [HttpDelete("nhom-thuoc/{maNhom}")]
        public async Task<IActionResult> DeleteNhomThuoc([FromQuery] string adminUsername, string maNhom)
        {
            var result = await _service.DeleteNhomThuoc(adminUsername, maNhom);
            if (result.StartsWith("LỖI"))
                return BadRequest(new { message = result });
            return Ok(new { message = result });
        }

        // ========== NHÀ CUNG CẤP ==========
        [HttpGet("nha-cung-cap")]
        public async Task<IActionResult> GetAllNhaCungCap([FromQuery] string adminUsername)
        {
            try
            {
                var data = await _service.GetAllNhaCungCap(adminUsername);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("nha-cung-cap")]
        public async Task<IActionResult> InsertNhaCungCap([FromQuery] string adminUsername, [FromBody] NhaCungCapInput input)
        {
            var result = await _service.InsertNhaCungCap(adminUsername, input.MaNcc, input.TenNcc, input.SoDienThoai);
            if (result.StartsWith("LỖI"))
                return BadRequest(new { message = result });
            return Ok(new { message = result });
        }

        [HttpPut("nha-cung-cap/{maNcc}")]
        public async Task<IActionResult> UpdateNhaCungCap([FromQuery] string adminUsername, string maNcc, [FromBody] NhaCungCapInput input)
        {
            var result = await _service.UpdateNhaCungCap(adminUsername, maNcc, input.TenNcc, input.SoDienThoai);
            if (result.StartsWith("LỖI"))
                return BadRequest(new { message = result });
            return Ok(new { message = result });
        }

        [HttpDelete("nha-cung-cap/{maNcc}")]
        public async Task<IActionResult> DeleteNhaCungCap([FromQuery] string adminUsername, string maNcc)
        {
            var result = await _service.DeleteNhaCungCap(adminUsername, maNcc);
            if (result.StartsWith("LỖI"))
                return BadRequest(new { message = result });
            return Ok(new { message = result });
        }
    }

    // Input models (có thể tạo file riêng nếu cần)
    public class NhomThuocInput
    {
        public string MaNhom { get; set; }
        public string TenNhom { get; set; }
    }

    public class NhaCungCapInput
    {
        public string MaNcc { get; set; }
        public string TenNcc { get; set; }
        public string SoDienThoai { get; set; }
    }
}