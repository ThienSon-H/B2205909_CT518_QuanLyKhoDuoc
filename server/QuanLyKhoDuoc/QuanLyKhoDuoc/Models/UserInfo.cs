namespace QuanLyKhoDuoc.Models
{
    public class UserInfo
    {
        public string Username { get; set; }
        public bool IsActive { get; set; }
        public bool IsAdmin { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}