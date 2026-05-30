using QuanLyKhoDuoc.Models;
using Dapper;
using Npgsql;

namespace QuanLyKhoDuoc.Services
{
    public class ThuocService
    {
        private readonly string _connString;

        public ThuocService(IConfiguration config)
        {
            // Lấy chuỗi kết nối từ appsettings.json
            _connString = config.GetConnectionString("DefaultConnection");
        }

        // 1. Hàm lấy dữ liệu Dashboard
        public async Task<IEnumerable<ChiTietKho>> GetDashboardData(string search = null, string trangThai = null)
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
                        FROM fn_get_dashboard_kho(@Search, @TrangThai)";
            
            var parameters = new
            {
                Search = string.IsNullOrWhiteSpace(search) ? null : search,
                TrangThai = string.IsNullOrWhiteSpace(trangThai) ? null : trangThai
            };
            
            return await db.QueryAsync<ChiTietKho>(sql, parameters);
        }

        // 2. Hàm Upsert thuốc (đã làm ở bước trước)
        public async Task<string> UpsertThuoc(Thuoc thuoc)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_upsert_thuoc(@MaThuoc, @TenThuoc, @SoLuongTon, @DonViTinh)";
            return await db.ExecuteScalarAsync<string>(sql, thuoc);
        }
        public async Task<string> NhapLoThuoc(LoThuocInput input)
        {
            using var db = new NpgsqlConnection(_connString);

            // THÊM ::DATE VÀO SAU @HanSuDung Ở DÒNG NÀY
            var sql = "SELECT fn_nhap_lo_thuoc(@MaLo, @MaThuoc, @TenThuoc, @MaNcc, @SoLuong, @HanSuDung::DATE)";

            var parameters = new
            {
                input.MaLo,
                input.MaThuoc,
                input.TenThuoc,
                input.MaNcc,
                input.SoLuong,
                // Vẫn giữ nguyên việc ép kiểu để "chiều" Dapper ở phía C#
                HanSuDung = input.HanSuDung.ToDateTime(TimeOnly.MinValue)
            };

            return await db.ExecuteScalarAsync<string>(sql, parameters);
        }
        public async Task<string> XuatLoThuoc(string maLo)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_xuat_lo_thuoc(@MaLo)";
            // Dapper sẽ tự động map tham số MaLo vào @MaLo
            return await db.ExecuteScalarAsync<string>(sql, new { MaLo = maLo });
        }
    }
}