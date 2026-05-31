namespace QuanLyKhoDuoc.Models
{
    public class LichSuItem
    {
        public int Id { get; set; }
        public string MaLo { get; set; }
        public string MaThuoc { get; set; }
        public string LoaiGiaoDich { get; set; }
        public int SoLuongThayDoi { get; set; }
        public string NguoiThucHien { get; set; }
        public DateTime ThoiGian { get; set; }
        public string GhiChu { get; set; }
    }
}