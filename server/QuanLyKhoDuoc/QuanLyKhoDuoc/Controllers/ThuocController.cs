using QuanLyKhoDuoc.Models;
using QuanLyKhoDuoc.Services;
using Microsoft.AspNetCore.Mvc;

namespace QuanLyKhoDuoc.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ThuocController : ControllerBase
    {
        private readonly ThuocService _service;
        public ThuocController(ThuocService service)
        {
            _service = service;
        }

        // Dashboard (GET): nhận username để kiểm tra active
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard(
            [FromQuery] string search = null,
            [FromQuery] string trangThai = null,
            [FromQuery] string username = null)
        {
            try
            {
                var data = await _service.GetDashboardData(search, trangThai, username);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Báo cáo tổng tồn kho (GET): nhận username
        [HttpGet("bao-cao-ton-kho")]
        public async Task<IActionResult> GetBaoCaoTonKho([FromQuery] string username = null)
        {
            try
            {
                var data = await _service.GetBaoCaoTonKho(username);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Lịch sử nhập xuất (GET): nhận username
        [HttpGet("lich-su")]
        public async Task<IActionResult> GetLichSu([FromQuery] string username = null)
        {
            try
            {
                var data = await _service.GetLichSu(username);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Nhập lô (POST): NguoiThucHien nằm trong body
        [HttpPost("nhap-lo")]
        public async Task<IActionResult> NhapLo([FromBody] LoThuocInput input)
        {
            var result = await _service.NhapLoThuoc(input);
            if (result.StartsWith("LỖI"))
                return BadRequest(new { message = result });
            return Ok(new { message = result });
        }

        // Xuất lô (DELETE): nhận nguoiThucHien từ query string
        [HttpDelete("xuat-lo/{maLo}")]
        public async Task<IActionResult> XuatLo(string maLo, [FromQuery] string nguoiThucHien = null)
        {
            var result = await _service.XuatLoThuoc(maLo, nguoiThucHien);
            if (result.StartsWith("LỖI"))
                return BadRequest(new { message = result });
            return Ok(new { message = result });
        }

        // Upsert thuốc (POST) - giữ nguyên
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Thuoc thuoc)
        {
            var result = await _service.UpsertThuoc(thuoc);
            return Ok(new { message = result });
        }
    }
}