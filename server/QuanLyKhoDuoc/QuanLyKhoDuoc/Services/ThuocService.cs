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

                // Dashboard phân trang
        public async Task<PagedResult<ChiTietKho>> GetDashboardDataPaged(
            string search = null, string trangThai = null, string username = null,
            int page = 1, int pageSize = 20)
        {
            using var db = new NpgsqlConnection(_connString);

            // Lấy tổng số bản ghi
            var countSql = "SELECT fn_get_dashboard_kho_count(@Search, @TrangThai, @Username)";
            var totalCount = await db.ExecuteScalarAsync<long>(countSql, new
            {
                Search = string.IsNullOrWhiteSpace(search) ? null : search,
                TrangThai = string.IsNullOrWhiteSpace(trangThai) ? null : trangThai,
                Username = username
            });

            // Lấy dữ liệu trang hiện tại
            var dataSql = @"SELECT
                                out_ma_thuoc as MaThuoc,
                                out_ten_thuoc as TenThuoc,
                                out_ten_nhom as TenNhom,
                                out_ma_lo as MaLo,
                                out_ten_ncc as TenNcc,
                                out_so_luong as SoLuong,
                                out_han_su_dung as HanSuDung,
                                out_ngay_con_lai as NgayConLai
                            FROM fn_get_dashboard_kho_paged(@Search, @TrangThai, @Username, @Page, @PageSize)";

            var data = await db.QueryAsync<ChiTietKho>(dataSql, new
            {
                Search = string.IsNullOrWhiteSpace(search) ? null : search,
                TrangThai = string.IsNullOrWhiteSpace(trangThai) ? null : trangThai,
                Username = username,
                Page = page,
                PageSize = pageSize
            });

            return new PagedResult<ChiTietKho>
            {
                Data = data,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };
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
        // Lịch sử nhập xuất phân trang (có tìm kiếm)
        public async Task<PagedResult<LichSuItem>> GetLichSuPaged(
            string username = null, string search = null, int page = 1, int pageSize = 20)
        {
            using var db = new NpgsqlConnection(_connString);

            var countSql = "SELECT fn_get_lich_su_nhap_xuat_count(@Username, @Search)";
            var totalCount = await db.ExecuteScalarAsync<long>(countSql, new
            {
                Username = username,
                Search = string.IsNullOrWhiteSpace(search) ? null : search
            });

            var dataSql = @"SELECT
                                out_id as Id,
                                out_ma_lo as MaLo,
                                out_ma_thuoc as MaThuoc,
                                out_loai_giao_dich as LoaiGiaoDich,
                                out_so_luong_thay_doi as SoLuongThayDoi,
                                out_nguoi_thuc_hien as NguoiThucHien,
                                out_thoi_gian as ThoiGian,
                                out_ghi_chu as GhiChu
                            FROM fn_get_lich_su_nhap_xuat_paged(@Username, @Search, @Page, @PageSize)";

            var data = await db.QueryAsync<LichSuItem>(dataSql, new
            {
                Username = username,
                Search = string.IsNullOrWhiteSpace(search) ? null : search,
                Page = page,
                PageSize = pageSize
            });

            return new PagedResult<LichSuItem>
            {
                Data = data,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        // Nhập lô (đã tích hợp ghi log, kiểm tra active của người thực hiện)
        public async Task<string> NhapLoThuoc(LoThuocInput input)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_nhap_lo_thuoc(@MaThuoc, @TenThuoc, @MaNcc, @SoLuong, @HanSuDung::DATE, @NguoiThucHien, @MaNhom, @MaLo)";
            var parameters = new
            {
                input.MaThuoc,
                input.TenThuoc,
                input.MaNcc,
                input.SoLuong,
                HanSuDung = input.HanSuDung.ToDateTime(TimeOnly.MinValue),
                NguoiThucHien = input.NguoiThucHien,
                MaNhom = input.MaNhom,
                MaLo = string.IsNullOrWhiteSpace(input.MaLo) ? null : input.MaLo
            };
            return await db.ExecuteScalarAsync<string>(sql, parameters);
        }

        // Xuất lô (đã tích hợp ghi log, kiểm tra active của người thực hiện)
        public async Task<string> XuatLoThuoc(string maLo, int soLuongXuat, string nguoiThucHien = null)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_xuat_lo_thuoc(@MaLo, @SoLuongXuat, @NguoiThucHien)";
            return await db.ExecuteScalarAsync<string>(sql, new
            {
                MaLo = maLo,
                SoLuongXuat = soLuongXuat,
                NguoiThucHien = nguoiThucHien
            });
        }
        
        public async Task<IEnumerable<ThuocAdmin>> GetAllThuoc(string adminUsername)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = @"SELECT
                            out_ma_thuoc AS MaThuoc,
                            out_ten_thuoc AS TenThuoc,
                            out_ten_nhom AS TenNhom,
                            out_don_vi_tinh AS DonViTinh,
                            out_tong_ton AS TongTon,
                            out_so_lo AS SoLo
                        FROM fn_get_all_thuoc(@AdminUsername)";
            return await db.QueryAsync<ThuocAdmin>(sql, new { AdminUsername = adminUsername });
        }

        public async Task<string> InsertThuoc(string adminUsername, string maThuoc, string tenThuoc, string maNhom, string donViTinh)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_insert_thuoc(@AdminUsername, @MaThuoc, @TenThuoc, @MaNhom, @DonViTinh)";
            return await db.ExecuteScalarAsync<string>(sql, new { AdminUsername = adminUsername, MaThuoc = maThuoc, TenThuoc = tenThuoc, MaNhom = maNhom, DonViTinh = donViTinh });
        }

        public async Task<string> UpdateThuoc(string adminUsername, string maThuoc, string tenThuoc, string maNhom, string donViTinh)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_update_thuoc(@AdminUsername, @MaThuoc, @TenThuoc, @MaNhom, @DonViTinh)";
            return await db.ExecuteScalarAsync<string>(sql, new { AdminUsername = adminUsername, MaThuoc = maThuoc, TenThuoc = tenThuoc, MaNhom = maNhom, DonViTinh = donViTinh });
        }

        public async Task<string> DeleteThuoc(string adminUsername, string maThuoc)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_delete_thuoc(@AdminUsername, @MaThuoc)";
            return await db.ExecuteScalarAsync<string>(sql, new { AdminUsername = adminUsername, MaThuoc = maThuoc });
        }

        public async Task<string> XuatThuocFefo(string maThuoc, int soLuongXuat, string nguoiThucHien)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_xuat_thuoc_fefo(@MaThuoc, @SoLuongXuat, @NguoiThucHien)";
            return await db.ExecuteScalarAsync<string>(sql, new
            {
                MaThuoc = maThuoc,
                SoLuongXuat = soLuongXuat,
                NguoiThucHien = nguoiThucHien
            });
        }
        
        public async Task<IEnumerable<ThuocSimple>> GetThuocListPublic(string username)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = @"SELECT out_ma_thuoc AS MaThuoc, out_ten_thuoc AS TenThuoc
                        FROM fn_get_thuoc_list_public(@Username)";
            return await db.QueryAsync<ThuocSimple>(sql, new { Username = username });
        }
    }
}