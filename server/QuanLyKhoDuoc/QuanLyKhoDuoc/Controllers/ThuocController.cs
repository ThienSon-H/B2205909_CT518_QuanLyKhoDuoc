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

        // GET: api/Thuoc/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard(
            [FromQuery] string search = null,
            [FromQuery] string trangThai = null)
        {
            var data = await _service.GetDashboardData(search, trangThai);
            return Ok(data);
        }

        // POST: api/Thuoc
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Thuoc thuoc)
        {
            var result = await _service.UpsertThuoc(thuoc);
            return Ok(new { message = result });
        }
        [HttpPost("nhap-lo")]
        public async Task<IActionResult> NhapLo([FromBody] LoThuocInput input)
        {
            var result = await _service.NhapLoThuoc(input);
            return Ok(new { message = result });
        }
        // DELETE: api/Thuoc/LO-001
        [HttpDelete("{maLo}")]
        [HttpDelete("xuat-lo/{maLo}")]
        public async Task<IActionResult> XuatLo(string maLo)
        {
            var result = await _service.XuatLoThuoc(maLo);
            return Ok(new { message = result });
        }

        [HttpGet("bao-cao-ton-kho")]
        public async Task<IActionResult> GetBaoCaoTonKho()
        {
            var data = await _service.GetBaoCaoTonKho();
            return Ok(data);
        }
    }
}