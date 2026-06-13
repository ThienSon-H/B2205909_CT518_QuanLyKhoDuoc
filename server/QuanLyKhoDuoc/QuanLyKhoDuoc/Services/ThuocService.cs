using Dapper;
using Npgsql;
using QuanLyKhoDuoc.Models;

namespace QuanLyKhoDuoc.Services
{
    public class ThuocService
    {
        private readonly string _connString;
        public ThuocService(IConfiguration config)
        {
            _connString = config.GetConnectionString("DefaultConnection");
        }

        // Dashboard (đã hỗ trợ tìm kiếm & lọc, kiểm tra active)
        public async Task<IEnumerable<ChiTietKho>> GetDashboardData(string search = null, string trangThai = null, string username = null)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = @"SELECT
                            out_ma_thuoc as MaThuoc,
                            out_ten_thuoc as TenThuoc,
                            out_ten_nhom as TenNhom,
                            out_ma_lo as MaLo,
                            out_ten_ncc as TenNcc,
                            out_so_luong as SoLuong,
                            out_han_su_dung as HanSuDung,
                            out_ngay_con_lai as NgayConLai
                        FROM fn_get_dashboard_kho(@Search, @TrangThai, @Username)";

            var parameters = new
            {
                Search = string.IsNullOrWhiteSpace(search) ? null : search,
                TrangThai = string.IsNullOrWhiteSpace(trangThai) ? null : trangThai,
                Username = username  // truyền username để function kiểm tra active
            };

            return await db.QueryAsync<ChiTietKho>(sql, parameters);
        }

        // Báo cáo tổng tồn kho (kiểm tra active)
        public async Task<IEnumerable<BaoCaoTonKho>> GetBaoCaoTonKho(string username = null)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = @"SELECT
                            out_ma_thuoc as MaThuoc,
                            out_ten_thuoc as TenThuoc,
                            out_ten_nhom as TenNhom,
                            out_tong_so_luong as TongSoLuong,
                            out_so_lo as SoLo,
                            out_han_som_nhat as HanSomNhat,
                            out_ngay_con_lai as NgayConLai
                        FROM fn_bao_cao_ton_kho(@Username)";

            return await db.QueryAsync<BaoCaoTonKho>(sql, new { Username = username });
        }

        // Lịch sử nhập xuất (kiểm tra active)
        public async Task<IEnumerable<LichSuItem>> GetLichSu(string username = null)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = @"SELECT
                            out_id as Id,
                            out_ma_lo as MaLo,
                            out_ma_thuoc as MaThuoc,
                            out_loai_giao_dich as LoaiGiaoDich,
                            out_so_luong_thay_doi as SoLuongThayDoi,
                            out_nguoi_thuc_hien as NguoiThucHien,
                            out_thoi_gian as ThoiGian,
                            out_ghi_chu as GhiChu
                        FROM fn_get_lich_su_nhap_xuat(@Username)";

            return await db.QueryAsync<LichSuItem>(sql, new { Username = username });
        }

        // Nhập lô (đã tích hợp ghi log, kiểm tra active của người thực hiện)
        public async Task<string> NhapLoThuoc(LoThuocInput input)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_nhap_lo_thuoc(@MaLo, @MaThuoc, @TenThuoc, @MaNcc, @SoLuong, @HanSuDung::DATE, @NguoiThucHien)";
            var parameters = new
            {
                input.MaLo,
                input.MaThuoc,
                input.TenThuoc,
                input.MaNcc,
                input.SoLuong,
                HanSuDung = input.HanSuDung.ToDateTime(TimeOnly.MinValue),
                NguoiThucHien = input.NguoiThucHien
            };
            return await db.ExecuteScalarAsync<string>(sql, parameters);
        }

        // Xuất lô (đã tích hợp ghi log, kiểm tra active của người thực hiện)
        public async Task<string> XuatLoThuoc(string maLo, string nguoiThucHien = null)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_xuat_lo_thuoc(@MaLo, @NguoiThucHien)";
            return await db.ExecuteScalarAsync<string>(sql, new { MaLo = maLo, NguoiThucHien = nguoiThucHien });
        }

        // Upsert thuốc (giữ nguyên)
        public async Task<string> UpsertThuoc(Thuoc thuoc)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_upsert_thuoc(@MaThuoc, @TenThuoc, @SoLuongTon, @DonViTinh)";
            return await db.ExecuteScalarAsync<string>(sql, thuoc);
        }
    }
}