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

        // ===== CÁC ROUTE CỤ THỂ (KHÔNG THAM SỐ TRÊN ĐƯỜNG DẪN) =====
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

        [HttpGet("list-public")]
        public async Task<IActionResult> GetThuocListPublic([FromQuery] string username)
        {
            try
            {
                var data = await _service.GetThuocListPublic(username);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetAllThuoc([FromQuery] string adminUsername)
        {
            try
            {
                var data = await _service.GetAllThuoc(adminUsername);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("nhap-lo")]
        public async Task<IActionResult> NhapLo([FromBody] LoThuocInput input)
        {
            var result = await _service.NhapLoThuoc(input);
            if (result.StartsWith("LỖI"))
                return BadRequest(new { message = result });
            return Ok(new { message = result });
        }

        [HttpPost("xuat-fefo")]
        public async Task<IActionResult> XuatThuocFefo([FromBody] XuatFefoInput input)
        {
            var result = await _service.XuatThuocFefo(input.MaThuoc, input.SoLuongXuat, input.NguoiThucHien);
            if (result.StartsWith("LỖI"))
                return BadRequest(new { message = result });
            return Ok(new { message = result });
        }

        [HttpDelete("xuat-lo/{maLo}")]
        public async Task<IActionResult> XuatLo(string maLo, [FromQuery] int soLuongXuat, [FromQuery] string nguoiThucHien = null)
        {
            var result = await _service.XuatLoThuoc(maLo, soLuongXuat, nguoiThucHien);
            if (result.StartsWith("LỖI"))
                return BadRequest(new { message = result });
            return Ok(new { message = result });
        }

        // ===== CÁC ROUTE CÓ THAM SỐ {maThuoc} (ĐẶT CUỐI CÙNG) =====
        [HttpPost]
        public async Task<IActionResult> InsertThuoc([FromQuery] string adminUsername, [FromBody] ThuocInput input)
        {
            var result = await _service.InsertThuoc(adminUsername, input.MaThuoc, input.TenThuoc, input.MaNhom, input.DonViTinh);
            if (result.StartsWith("LỖI"))
                return BadRequest(new { message = result });
            return Ok(new { message = result });
        }

        [HttpPut("{maThuoc}")]
        public async Task<IActionResult> UpdateThuoc([FromQuery] string adminUsername, string maThuoc, [FromBody] ThuocInput input)
        {
            var result = await _service.UpdateThuoc(adminUsername, maThuoc, input.TenThuoc, input.MaNhom, input.DonViTinh);
            if (result.StartsWith("LỖI"))
                return BadRequest(new { message = result });
            return Ok(new { message = result });
        }

        [HttpDelete("{maThuoc}")]
        public async Task<IActionResult> DeleteThuoc([FromQuery] string adminUsername, string maThuoc)
        {
            var result = await _service.DeleteThuoc(adminUsername, maThuoc);
            if (result.StartsWith("LỖI"))
                return BadRequest(new { message = result });
            return Ok(new { message = result });
        }
    }

    // DTOs
    public class ThuocInput
    {
        public string MaThuoc { get; set; }
        public string TenThuoc { get; set; }
        public string MaNhom { get; set; }
        public string DonViTinh { get; set; }
    }

    public class XuatFefoInput
    {
        public string MaThuoc { get; set; }
        public int SoLuongXuat { get; set; }
        public string NguoiThucHien { get; set; }
    }
}