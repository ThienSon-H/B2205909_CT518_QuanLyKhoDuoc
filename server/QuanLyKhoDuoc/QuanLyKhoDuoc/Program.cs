using QuanLyKhoDuoc.Services;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// 1. Khai báo Service
builder.Services.AddScoped<ThuocService>();
builder.Services.AddScoped<AuthService>();

// 2. Mở cổng cho React (CORS)
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReact", p => p.WithOrigins("http://localhost:5173").AllowAnyMethod().AllowAnyHeader());
});

// --- PHẦN ĐĂNG KÝ DỊCH VỤ (Trước builder.Build()) ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer(); // Dòng này cực kỳ quan trọng
builder.Services.AddSwaggerGen(); // Đăng ký bộ phát sinh Swagger

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReact");

app.UseAuthorization();

app.MapControllers();

app.Run();
