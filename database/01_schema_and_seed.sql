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

-- Thuốc bổ sung để test phân trang
INSERT INTO thuoc (ma_thuoc, ten_thuoc, don_vi_tinh, ma_nhom) VALUES
    ('CIPR', 'Ciprofloxacin 500mg', 'Viên', 'KS'),
    ('METR', 'Metronidazol 250mg', 'Viên', 'KS'),
    ('IBUP', 'Ibuprofen 400mg', 'Viên', 'GD'),
    ('DICL', 'Diclofenac 50mg', 'Viên', 'GD'),
    ('LEVO', 'Levothyroxine 50mcg', 'Viên', 'HH');

-- Lô thuốc bổ sung (đủ để dashboard có 28 lô)
INSERT INTO lo_thuoc (ma_lo, ma_thuoc, ma_ncc, so_luong, ngay_san_xuat, han_su_dung) VALUES
    ('LO-PARA-03', 'PARA', 'TAP', 100, '2025-05-10', '2028-06-30'),
    ('LO-PARA-04', 'PARA', 'DHG', 80, '2025-06-01', '2027-09-15'),
    ('LO-PARA-05', 'PARA', 'SANOFI', 60, '2025-07-20', '2026-11-30'),
    ('LO-HAPA-01', 'HAPA', 'DHG', 120, '2025-08-01', '2028-02-28'),
    ('LO-HAPA-02', 'HAPA', 'TAP', 90, '2025-08-15', '2027-07-15'),
    ('LO-AMOX-02', 'AMOX', 'SANOFI', 300, '2025-09-01', '2029-01-01'),
    ('LO-AMOX-03', 'AMOX', 'TAP', 150, '2025-09-15', '2028-08-20'),
    ('LO-AMOX-04', 'AMOX', 'DHG', 250, '2025-10-01', '2027-03-10'),
    ('LO-INSU-02', 'INSU', 'DHG', 40, '2025-10-15', '2026-09-30'),
    ('LO-INSU-03', 'INSU', 'SANOFI', 35, '2025-11-01', '2027-05-15'),
    ('LO-CIPR-01', 'CIPR', 'DHG', 200, '2025-11-15', '2028-12-31'),
    ('LO-CIPR-02', 'CIPR', 'TAP', 180, '2025-12-01', '2027-10-15'),
    ('LO-METR-01', 'METR', 'SANOFI', 160, '2025-12-15', '2028-06-30'),
    ('LO-METR-02', 'METR', 'DHG', 140, '2026-01-01', '2027-04-15'),
    ('LO-IBUP-01', 'IBUP', 'TAP', 220, '2026-01-15', '2029-02-28'),
    ('LO-IBUP-02', 'IBUP', 'DHG', 190, '2026-02-01', '2028-08-20'),
    ('LO-IBUP-03', 'IBUP', 'SANOFI', 110, '2026-02-15', '2027-01-15'),
    ('LO-DICL-01', 'DICL', 'DHG', 170, '2026-03-01', '2028-11-30'),
    ('LO-DICL-02', 'DICL', 'TAP', 130, '2026-03-15', '2027-06-15'),
    ('LO-LEVO-01', 'LEVO', 'SANOFI', 90, '2026-04-01', '2029-04-30'),
    ('LO-LEVO-02', 'LEVO', 'DHG', 75, '2026-04-15', '2028-01-15'),
    ('LO-CIPR-03', 'CIPR', 'SANOFI', 210, '2026-05-01', '2029-07-31'),
    ('LO-DICL-03', 'DICL', 'DHG', 145, '2026-05-15', '2027-11-15'),
    ('LO-METR-03', 'METR', 'TAP', 125, '2026-06-01', '2028-03-30');

-- Lịch sử nhập/xuất bổ sung (để lịch sử có vài chục bản ghi)
INSERT INTO lich_su_nhap_xuat (ma_lo, ma_thuoc, loai_giao_dich, so_luong_thay_doi, nguoi_thuc_hien, ghi_chu) VALUES
    -- Nhập các lô mới
    ('LO-PARA-03', 'PARA', 'NHAP', 100, 'admin2', 'Nhập từ TAP'),
    ('LO-PARA-04', 'PARA', 'NHAP', 80, 'admin1', 'Nhập bổ sung DHG'),
    ('LO-PARA-05', 'PARA', 'NHAP', 60, 'user1', 'Nhập bổ sung Sanofi'),
    ('LO-HAPA-01', 'HAPA', 'NHAP', 120, 'admin2', 'Nhập hàng DHG'),
    ('LO-HAPA-02', 'HAPA', 'NHAP', 90, 'admin1', 'Nhập hàng TAP'),
    ('LO-AMOX-02', 'AMOX', 'NHAP', 300, 'admin2', 'Nhập số lượng lớn từ Sanofi'),
    ('LO-AMOX-03', 'AMOX', 'NHAP', 150, 'user1', 'Nhập từ TAP'),
    ('LO-AMOX-04', 'AMOX', 'NHAP', 250, 'admin1', 'Nhập DHG đợt 2'),
    ('LO-INSU-02', 'INSU', 'NHAP', 40, 'admin2', 'Nhập DHG insulin mới'),
    ('LO-INSU-03', 'INSU', 'NHAP', 35, 'user1', 'Nhập Sanofi insulin'),
    ('LO-CIPR-01', 'CIPR', 'NHAP', 200, 'admin1', 'Nhập kháng sinh mới'),
    ('LO-CIPR-02', 'CIPR', 'NHAP', 180, 'admin2', 'Nhập Cipro TAP'),
    ('LO-METR-01', 'METR', 'NHAP', 160, 'admin1', 'Nhập Metronidazol'),
    ('LO-METR-02', 'METR', 'NHAP', 140, 'user1', 'Nhập bổ sung'),
    ('LO-IBUP-01', 'IBUP', 'NHAP', 220, 'admin2', 'Nhập Ibuprofen'),
    ('LO-IBUP-02', 'IBUP', 'NHAP', 190, 'admin1', 'Nhập bổ sung'),
    ('LO-IBUP-03', 'IBUP', 'NHAP', 110, 'user1', 'Nhập đợt 2'),
    ('LO-DICL-01', 'DICL', 'NHAP', 170, 'admin2', 'Nhập Diclofenac'),
    ('LO-DICL-02', 'DICL', 'NHAP', 130, 'admin1', 'Nhập bổ sung'),
    ('LO-LEVO-01', 'LEVO', 'NHAP', 90, 'admin2', 'Nhập Levothyroxine'),
    ('LO-LEVO-02', 'LEVO', 'NHAP', 75, 'user1', 'Nhập bổ sung'),
    ('LO-CIPR-03', 'CIPR', 'NHAP', 210, 'admin1', 'Nhập Cipro đợt 3'),
    ('LO-DICL-03', 'DICL', 'NHAP', 145, 'admin2', 'Nhập Diclofenac đợt 2'),
    ('LO-METR-03', 'METR', 'NHAP', 125, 'user1', 'Nhập Metronidazol đợt 3'),
    -- Một số giao dịch xuất
    ('LO-PARA-03', 'PARA', 'XUAT', -20, 'user1', 'Xuất cho khoa Nhi'),
    ('LO-AMOX-02', 'AMOX', 'XUAT', -50, 'user1', 'Xuất cho bệnh nhân C'),
    ('LO-IBUP-01', 'IBUP', 'XUAT', -30, 'admin2', 'Xuất thanh lý'),
    ('LO-CIPR-01', 'CIPR', 'XUAT', -15, 'admin1', 'Xuất cho bệnh nhân D'),
    ('LO-DICL-01', 'DICL', 'XUAT', -25, 'user1', 'Xuất khoa Ngoại'),
    ('LO-LEVO-01', 'LEVO', 'XUAT', -10, 'admin2', 'Xuất điều chuyển');