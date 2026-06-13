using QuanLyKhoDuoc.Models;
using Dapper;
using Npgsql;
using System.Text.Json;

namespace QuanLyKhoDuoc.Services
{
    public class AuthService
    {
        private readonly string _connString;

        public AuthService(IConfiguration config)
        {
            _connString = config.GetConnectionString("DefaultConnection");
        }

        // Đăng ký
        public async Task<string> Register(RegisterRequest request)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_register(@Username, @Password)";
            return await db.ExecuteScalarAsync<string>(sql, new { request.Username, request.Password });
        }

        // Đăng nhập -> trả về JSON string từ function
        public async Task<LoginResult> Login(LoginRequest request)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_login(@Username, @Password)";
            var jsonResult = await db.ExecuteScalarAsync<string>(sql, new { request.Username, request.Password });

            // Giải mã JSON trả về từ function
            var doc = JsonDocument.Parse(jsonResult);
            var success = doc.RootElement.GetProperty("success").GetBoolean();

            if (!success)
            {
                var message = doc.RootElement.GetProperty("message").GetString();
                return new LoginResult { Success = false, Message = message };
            }

            return new LoginResult
            {
                Success = true,
                Username = doc.RootElement.GetProperty("username").GetString(),
                IsAdmin = doc.RootElement.GetProperty("is_admin").GetBoolean(),
                IsActive = doc.RootElement.GetProperty("is_active").GetBoolean()
            };
        }

        // Lấy danh sách tất cả user (chỉ admin)
        public async Task<IEnumerable<UserInfo>> GetAllUsers(string adminUsername)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = @"SELECT 
                            out_username AS Username, 
                            out_is_active AS IsActive, 
                            out_is_admin AS IsAdmin, 
                            out_created_at AS CreatedAt 
                        FROM fn_get_all_users(@AdminUsername)";
            return await db.QueryAsync<UserInfo>(sql, new { AdminUsername = adminUsername });
        }
        // Vô hiệu hóa / mở khóa tài khoản
        public async Task<string> ToggleUserActive(string adminUsername, string targetUsername)
        {
            using var db = new NpgsqlConnection(_connString);
            var sql = "SELECT fn_toggle_user_active(@AdminUsername, @TargetUsername)";
            return await db.ExecuteScalarAsync<string>(sql, new { AdminUsername = adminUsername, TargetUsername = targetUsername });
        }
    }

    // Helper class cho kết quả đăng nhập
    public class LoginResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string Username { get; set; }
        public bool IsAdmin { get; set; }
        public bool IsActive { get; set; }
    }
}