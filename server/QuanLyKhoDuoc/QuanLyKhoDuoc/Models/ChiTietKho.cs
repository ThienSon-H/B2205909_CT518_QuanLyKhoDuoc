namespace QuanLyKhoDuoc.Models
{
    public class ChiTietKho
    {
        public string MaThuoc { get; set; }
        public string TenThuoc { get; set; }
        public string TenNhom { get; set; }
        public string MaLo { get; set; }
        public string TenNcc { get; set; }
        public int SoLuong { get; set; }

        // Sửa DateTime thành DateOnly
        public DateOnly HanSuDung { get; set; }

        public int NgayConLai { get; set; }
    }
}