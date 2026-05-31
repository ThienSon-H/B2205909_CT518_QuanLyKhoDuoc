namespace QuanLyKhoDuoc.Models
{
    public class BaoCaoTonKho
    {
        public string MaThuoc { get; set; }
        public string TenThuoc { get; set; }
        public string TenNhom { get; set; }
        public long TongSoLuong { get; set; }
        public int SoLo { get; set; }
        public DateOnly? HanSomNhat { get; set; } // Có thể null nếu chưa có lô
        public int? NgayConLai { get; set; } // Có thể null
    }
}