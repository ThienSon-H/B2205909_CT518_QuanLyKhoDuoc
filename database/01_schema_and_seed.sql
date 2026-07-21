-- =============================================
-- FILE: 01_schema_and_seed.sql
-- Mục đích: Tạo cấu trúc bảng và dữ liệu mẫu cho hệ thống quản lý thuốc
-- Lưu ý: Không thay đổi cấu trúc vì dự án đã chạy ổn định, chỉ tổ chức lại và bổ sung dữ liệu mẫu.
-- =============================================

\encoding UTF8

-- 1. Kích hoạt extension hỗ trợ mã hóa mật khẩu
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- 2. CẤU TRÚC BẢNG
-- =============================================

-- Bảng nhóm thuốc
CREATE TABLE nhom_thuoc (
    ma_nhom VARCHAR(20) PRIMARY KEY,
    ten_nhom TEXT NOT NULL
);

-- Bảng nhà cung cấp
CREATE TABLE nha_cung_cap (
    ma_ncc VARCHAR(20) PRIMARY KEY,
    ten_ncc TEXT NOT NULL,
    so_dien_thoai VARCHAR(15)
);

-- Bảng thuốc
CREATE TABLE thuoc (
    ma_thuoc VARCHAR(20) PRIMARY KEY,
    ten_thuoc TEXT NOT NULL,
    don_vi_tinh VARCHAR(50),
    ma_nhom VARCHAR(20) REFERENCES nhom_thuoc(ma_nhom)
);

-- Bảng lô thuốc
CREATE TABLE lo_thuoc (
    ma_lo VARCHAR(50) PRIMARY KEY,
    ma_thuoc VARCHAR(20) REFERENCES thuoc(ma_thuoc),
    ma_ncc VARCHAR(20) REFERENCES nha_cung_cap(ma_ncc),
    so_luong INTEGER NOT NULL DEFAULT 0,
    ngay_san_xuat DATE,
    han_su_dung DATE NOT NULL
);

-- Bảng tài khoản người dùng
CREATE TABLE taikhoan (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    can_manage_inventory BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng lịch sử nhập/xuất (theo dõi biến động số lượng)
CREATE TABLE IF NOT EXISTS lich_su_nhap_xuat (
    id SERIAL PRIMARY KEY,
    ma_lo VARCHAR(50),
    ma_thuoc VARCHAR(20),
    loai_giao_dich VARCHAR(10) NOT NULL,      -- 'NHAP' hoặc 'XUAT'
    so_luong_thay_doi INTEGER NOT NULL,       -- số lượng thay đổi (dương cho nhập, âm cho xuất)
    nguoi_thuc_hien VARCHAR(50),
    thoi_gian TIMESTAMP DEFAULT NOW(),
    ghi_chu TEXT
);

-- =============================================
-- 3. DỮ LIỆU MẪU
-- =============================================

-- 3.1. Nhóm thuốc
INSERT INTO nhom_thuoc (ma_nhom, ten_nhom) VALUES
    ('KS', 'Kháng sinh'),
    ('GD', 'Giảm đau - Hạ sốt'),
    ('HH', 'Hormone - Nội tiết');

-- 3.2. Nhà cung cấp
INSERT INTO nha_cung_cap (ma_ncc, ten_ncc, so_dien_thoai) VALUES
    ('DHG', 'Dược Hậu Giang', '19001234'),
    ('SANOFI', 'Sanofi VN', '19005678'),
    ('TAP', 'Tập đoàn Dược phẩm TAP', '19008765');

-- 3.3. Thuốc
INSERT INTO thuoc (ma_thuoc, ten_thuoc, don_vi_tinh, ma_nhom) VALUES
    ('PARA', 'Paracetamol 500mg', 'Viên', 'GD'),
    ('HAPA', 'Hapacol 650mg', 'Gói', 'GD'),
    ('AMOX', 'Amoxicillin 500mg', 'Viên', 'KS'),
    ('INSU', 'Insulin 100IU', 'Ống', 'HH');

-- 3.4. Lô thuốc
INSERT INTO lo_thuoc (ma_lo, ma_thuoc, ma_ncc, so_luong, ngay_san_xuat, han_su_dung) VALUES
    ('LO-PARA-01', 'PARA', 'DHG', 50, '2025-01-01', '2027-12-31'),
    ('LO-PARA-02', 'PARA', 'SANOFI', 50, '2025-03-15', '2026-06-15'),
    ('LO-AMOX-01', 'AMOX', 'DHG', 200, '2025-02-10', '2028-01-01'),
    ('LO-INSU-01', 'INSU', 'TAP', 30, '2025-04-01', '2026-04-01');

-- 3.5. Tài khoản (mật khẩu: admin1, user1)
INSERT INTO taikhoan (username, password_hash, is_admin, is_active) VALUES
    ('admin1', crypt('admin1', gen_salt('bf')), true, true),
    ('admin2', crypt('admin2', gen_salt('bf')), true, true),
    ('user1', crypt('user1', gen_salt('bf')), false, true);

-- 3.6. Lịch sử nhập/xuất (minh họa)
INSERT INTO lich_su_nhap_xuat (ma_lo, ma_thuoc, loai_giao_dich, so_luong_thay_doi, nguoi_thuc_hien, ghi_chu) VALUES
    ('LO-PARA-01', 'PARA', 'NHAP', 50, 'admin1', 'Nhập kho ban đầu'),
    ('LO-AMOX-01', 'AMOX', 'NHAP', 200, 'admin1', 'Nhập kho ban đầu'),
    ('LO-PARA-02', 'PARA', 'NHAP', 50, 'user1', 'Bổ sung từ Sanofi'),
    ('LO-PARA-01', 'PARA', 'XUAT', -10, 'user1', 'Xuất cho bệnh nhân A'),
    ('LO-AMOX-01', 'AMOX', 'XUAT', -5, 'user1', 'Xuất cho bệnh nhân B'),
    ('LO-INSU-01', 'INSU', 'NHAP', 30, 'admin1', 'Nhập insulin mới');