using Dapper;
using Npgsql;
using QuanLyKhoDuoc.Models;

namespace QuanLyKhoDuoc.Services
{
    public class DanhMucService
    {
        private readonly string _connString;
        public DanhMucService(IConfiguration config)
        {
            _connString = config.GetConnectionString("DefaultConnection");
        }

        // ========== NHÓM THUỐC ==========
        public async Task<IEnumerable<NhomThuoc>> GetAllNhomThuoc(string adminUsername)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = @"SELECT out_ma_nhom AS MaNhom, out_ten_nhom AS TenNhom 
                        FROM fn_get_all_nhom_thuoc(@AdminUsername)";
            return await db.QueryAsync<NhomThuoc>(sql, new { AdminUsername = adminUsername });
        }

        public async Task<string> InsertNhomThuoc(string adminUsername, string maNhom, string tenNhom)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_insert_nhom_thuoc(@AdminUsername, @MaNhom, @TenNhom)";
            return await db.ExecuteScalarAsync<string>(sql, new { AdminUsername = adminUsername, MaNhom = maNhom, TenNhom = tenNhom });
        }

        public async Task<string> UpdateNhomThuoc(string adminUsername, string maNhom, string tenNhom)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_update_nhom_thuoc(@AdminUsername, @MaNhom, @TenNhom)";
            return await db.ExecuteScalarAsync<string>(sql, new { AdminUsername = adminUsername, MaNhom = maNhom, TenNhom = tenNhom });
        }

        public async Task<string> DeleteNhomThuoc(string adminUsername, string maNhom)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_delete_nhom_thuoc(@AdminUsername, @MaNhom)";
            return await db.ExecuteScalarAsync<string>(sql, new { AdminUsername = adminUsername, MaNhom = maNhom });
        }

        // ========== NHÀ CUNG CẤP ==========
        public async Task<IEnumerable<NhaCungCap>> GetAllNhaCungCap(string adminUsername)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = @"SELECT out_ma_ncc AS MaNcc, out_ten_ncc AS TenNcc, out_so_dien_thoai AS SoDienThoai 
                        FROM fn_get_all_nha_cung_cap(@AdminUsername)";
            return await db.QueryAsync<NhaCungCap>(sql, new { AdminUsername = adminUsername });
        }

        public async Task<string> InsertNhaCungCap(string adminUsername, string maNcc, string tenNcc, string soDienThoai)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_insert_nha_cung_cap(@AdminUsername, @MaNcc, @TenNcc, @SoDienThoai)";
            return await db.ExecuteScalarAsync<string>(sql, new { AdminUsername = adminUsername, MaNcc = maNcc, TenNcc = tenNcc, SoDienThoai = soDienThoai });
        }

        public async Task<string> UpdateNhaCungCap(string adminUsername, string maNcc, string tenNcc, string soDienThoai)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_update_nha_cung_cap(@AdminUsername, @MaNcc, @TenNcc, @SoDienThoai)";
            return await db.ExecuteScalarAsync<string>(sql, new { AdminUsername = adminUsername, MaNcc = maNcc, TenNcc = tenNcc, SoDienThoai = soDienThoai });
        }

        public async Task<string> DeleteNhaCungCap(string adminUsername, string maNcc)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_delete_nha_cung_cap(@AdminUsername, @MaNcc)";
            return await db.ExecuteScalarAsync<string>(sql, new { AdminUsername = adminUsername, MaNcc = maNcc });
        }
        // Lấy danh sách nhà cung cấp cho mọi user active
        public async Task<IEnumerable<NhaCungCap>> GetAllNhaCungCapPublic(string username)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = @"SELECT out_ma_ncc AS MaNcc, out_ten_ncc AS TenNcc, out_so_dien_thoai AS SoDienThoai 
                        FROM fn_get_nha_cung_cap_public(@Username)";
            return await db.QueryAsync<NhaCungCap>(sql, new { Username = username });
        }

        // Lấy danh sách nhóm thuốc cho mọi user active
        public async Task<IEnumerable<NhomThuoc>> GetAllNhomThuocPublic(string username)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = @"SELECT out_ma_nhom AS MaNhom, out_ten_nhom AS TenNhom 
                        FROM fn_get_nhom_thuoc_public(@Username)";
            return await db.QueryAsync<NhomThuoc>(sql, new { Username = username });
        }
    }
}