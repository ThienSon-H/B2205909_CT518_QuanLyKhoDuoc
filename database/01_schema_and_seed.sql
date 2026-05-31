-- =============================================
-- FILE: 01_schema_and_seed.sql
-- Mô tả: Tạo cấu trúc bảng và dữ liệu mẫu
-- =============================================

\encoding UTF8

-- 1. Extension cho mã hóa mật khẩu
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Bảng danh mục
CREATE TABLE nhom_thuoc (
    ma_nhom VARCHAR(20) PRIMARY KEY,
    ten_nhom TEXT NOT NULL
);

CREATE TABLE nha_cung_cap (
    ma_ncc VARCHAR(20) PRIMARY KEY,
    ten_ncc TEXT NOT NULL,
    so_dien_thoai VARCHAR(15)
);

CREATE TABLE thuoc (
    ma_thuoc VARCHAR(20) PRIMARY KEY,
    ten_thuoc TEXT NOT NULL,
    so_luong_ton INTEGER DEFAULT 0,
    don_vi_tinh VARCHAR(50),
    ma_nhom VARCHAR(20) REFERENCES nhom_thuoc(ma_nhom)
);

CREATE TABLE lo_thuoc (
    ma_lo VARCHAR(50) PRIMARY KEY,
    ma_thuoc VARCHAR(20) REFERENCES thuoc(ma_thuoc),
    ma_ncc VARCHAR(20) REFERENCES nha_cung_cap(ma_ncc),
    so_luong INTEGER NOT NULL DEFAULT 0,
    ngay_san_xuat DATE,
    han_su_dung DATE NOT NULL
);

CREATE TABLE taikhoan (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tạo bảng lịch sử nhập xuất
CREATE TABLE IF NOT EXISTS lich_su_nhap_xuat (
    id SERIAL PRIMARY KEY,
    ma_lo VARCHAR(50),
    ma_thuoc VARCHAR(20),
    loai_giao_dich VARCHAR(10) NOT NULL, -- 'NHAP' hoặc 'XUAT'
    so_luong_thay_doi INTEGER NOT NULL,
    nguoi_thuc_hien VARCHAR(50),
    thoi_gian TIMESTAMP DEFAULT NOW(),
    ghi_chu TEXT
);

-- 3. Dữ liệu mẫu
INSERT INTO nhom_thuoc (ma_nhom, ten_nhom) VALUES
('KS', 'Kháng sinh'),
('GD', 'Giảm đau - Hạ sốt');

INSERT INTO nha_cung_cap (ma_ncc, ten_ncc, so_dien_thoai) VALUES
('DHG', 'Dược Hậu Giang', '19001234'),
('SANOFI', 'Sanofi VN', '19005678');

INSERT INTO thuoc (ma_thuoc, ten_thuoc, so_luong_ton, don_vi_tinh, ma_nhom) VALUES
('PARA', 'Paracetamol 500mg', 100, 'Viên', 'GD'),
('HAPA', 'Hapacol 650mg', 50, 'Gói', 'GD'),
('AMOX', 'Amoxicillin 500mg', 200, 'Viên', 'KS');

INSERT INTO lo_thuoc (ma_lo, ma_thuoc, ma_ncc, so_luong, han_su_dung) VALUES
('LO-PARA-01', 'PARA', 'DHG', 50, '2027-12-31'),
('LO-PARA-02', 'PARA', 'SANOFI', 50, '2026-06-15'),
('LO-AMOX-01', 'AMOX', 'DHG', 200, '2028-01-01');

-- Admin mặc định (password: admin1)
INSERT INTO taikhoan (username, password_hash, is_admin, is_active)
VALUES ('admin1', crypt('admin1', gen_salt('bf')), true, true);