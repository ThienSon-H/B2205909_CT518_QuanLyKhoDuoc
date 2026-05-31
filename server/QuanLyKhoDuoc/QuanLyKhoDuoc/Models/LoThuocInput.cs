namespace QuanLyKhoDuoc.Models
{
    public class LoThuocInput
    {
        public string MaLo { get; set; }
        public string MaThuoc { get; set; }
        public string TenThuoc { get; set; }
        public string MaNcc { get; set; }
        public int SoLuong { get; set; }
        public DateOnly HanSuDung { get; set; }
        public string NguoiThucHien { get; set; }
    }
}