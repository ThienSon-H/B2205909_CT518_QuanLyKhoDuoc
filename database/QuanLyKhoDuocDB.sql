-- ALTER DATABASE "test_KhoDuocDB" RENAME TO "QuanLyKhoDuocDB";
-- Tạo bảng Danh mục thuốc đơn giản để chạy thử (PoC
CREATE TABLE thuoc (
    ma_thuoc VARCHAR(20) PRIMARY KEY,
    ten_thuoc TEXT NOT NULL,
    so_luong_ton INTEGER DEFAULT 0,
    don_vi_tinh VARCHAR(50)
);

-- Chèn vài dòng dữ liệu để lát nữa có cái mà hiển thị lên Web
INSERT INTO thuoc (ma_thuoc, ten_thuoc, so_luong_ton, don_vi_tinh) VALUES
('PARA', 'Paracetamol 500mg', 100, 'Viên'),
('HAPA', 'Hapacol 650mg', 50, 'Gói'),
('AMOX', 'Amoxicillin 500mg', 200, 'Viên');

-- 1. Tạo bảng Nhóm Thuốc
CREATE TABLE nhom_thuoc (
    ma_nhom VARCHAR(20) PRIMARY KEY,
    ten_nhom TEXT NOT NULL
);

INSERT INTO nhom_thuoc (ma_nhom, ten_nhom) VALUES 
('KS', 'Kháng sinh'), ('GD', 'Giảm đau - Hạ sốt') ON CONFLICT DO NOTHING;

-- 2. Tạo bảng Nhà Cung Cấp
CREATE TABLE nha_cung_cap (
    ma_ncc VARCHAR(20) PRIMARY KEY,
    ten_ncc TEXT NOT NULL,
    so_dien_thoai VARCHAR(15)
);

INSERT INTO nha_cung_cap (ma_ncc, ten_ncc, so_dien_thoai) VALUES 
('DHG', 'Dược Hậu Giang', '19001234'), ('SANOFI', 'Sanofi VN', '19005678') ON CONFLICT DO NOTHING;

UPDATE thuoc SET ma_nhom = 'GD' WHERE ma_thuoc IN ('PARA', 'HAPA');
UPDATE thuoc SET ma_nhom = 'KS' WHERE ma_thuoc = 'AMOX';

-- 3. Cập nhật bảng Thuốc hiện tại (Thêm cột ma_nhom)
-- Lưu ý: Chạy lệnh này nếu bạn muốn giữ lại bảng thuoc cũ
ALTER TABLE thuoc ADD COLUMN ma_nhom VARCHAR(20);
ALTER TABLE thuoc ADD CONSTRAINT fk_nhom FOREIGN KEY (ma_nhom) REFERENCES nhom_thuoc(ma_nhom);

-- 4. Tạo bảng Lô Thuốc (Trái tim của quản lý kho)
CREATE TABLE lo_thuoc (
    ma_lo VARCHAR(50) PRIMARY KEY,
    ma_thuoc VARCHAR(20) REFERENCES thuoc(ma_thuoc),
    ma_ncc VARCHAR(20) REFERENCES nha_cung_cap(ma_ncc),
    so_luong INTEGER NOT NULL DEFAULT 0,
    ngay_san_xuat DATE,
    han_su_dung DATE NOT NULL
);

INSERT INTO lo_thuoc (ma_lo, ma_thuoc, ma_ncc, so_luong, han_su_dung) VALUES 
('LO-PARA-01', 'PARA', 'DHG', 50, '2027-12-31'),
('LO-PARA-02', 'PARA', 'SANOFI', 50, '2026-06-15'),  -- Lô này sắp hết hạn (cận date)
('LO-AMOX-01', 'AMOX', 'DHG', 200, '2028-01-01') ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION fn_get_danh_sach_thuoc()
RETURNS TABLE (
    out_ma_thuoc VARCHAR,
    out_ten_thuoc TEXT,
    out_so_luong INTEGER,
    out_dvt VARCHAR
) 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Đây chính là nơi "The Processor" làm việc
    RETURN QUERY 
    SELECT ma_thuoc, ten_thuoc, so_luong_ton, don_vi_tinh 
    FROM thuoc
    ORDER BY ten_thuoc ASC;
END;
$$;

-- SELECT * FROM fn_get_danh_sach_thuoc();

CREATE OR REPLACE FUNCTION fn_upsert_thuoc(
    p_ma_thuoc VARCHAR,
    p_ten_thuoc TEXT,
    p_so_luong INTEGER,
    p_dvt VARCHAR
)
RETURNS TEXT 
LANGUAGE plpgsql
AS $$
BEGIN
    -- KIỂM TRA: Nếu số lượng nhỏ hơn hoặc bằng 0 thì báo lỗi ngay
    IF p_so_luong <= 0 THEN
        RETURN 'LỖI: Số lượng nhập vào phải lớn hơn 0!';
    END IF;

    -- Nếu hợp lệ thì mới tiến hành xử lý tiếp
    IF EXISTS (SELECT 1 FROM thuoc WHERE ma_thuoc = p_ma_thuoc) THEN
        UPDATE thuoc 
        SET so_luong_ton = so_luong_ton + p_so_luong
        WHERE ma_thuoc = p_ma_thuoc;
        RETURN 'Đã cập nhật số lượng cho thuốc: ' || p_ten_thuoc;
    ELSE
        INSERT INTO thuoc (ma_thuoc, ten_thuoc, so_luong_ton, don_vi_tinh)
        VALUES (p_ma_thuoc, p_ten_thuoc, p_so_luong, p_dvt);
        RETURN 'Đã thêm mới thuốc: ' || p_ten_thuoc;
    END IF;
END;
$$;

SELECT fn_upsert_thuoc('PARA', 'Paracetamol 500mg', -10, 'Viên');

CREATE OR REPLACE FUNCTION fn_get_dashboard_kho()
RETURNS TABLE (
    out_ma_thuoc VARCHAR, out_ten_thuoc TEXT, out_ten_nhom TEXT,
    out_ma_lo VARCHAR, out_ten_ncc TEXT, out_so_luong INTEGER,
    out_han_su_dung DATE, out_ngay_con_lai INTEGER
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.ma_thuoc, t.ten_thuoc, COALESCE(nt.ten_nhom, 'Chưa phân nhóm'),
        l.ma_lo, COALESCE(ncc.ten_ncc, 'Khác'), l.so_luong, l.han_su_dung,
        (l.han_su_dung - CURRENT_DATE)::INTEGER AS out_ngay_con_lai
    FROM lo_thuoc l
    JOIN thuoc t ON l.ma_thuoc = t.ma_thuoc
    LEFT JOIN nhom_thuoc nt ON t.ma_nhom = nt.ma_nhom
    LEFT JOIN nha_cung_cap ncc ON l.ma_ncc = ncc.ma_ncc
    ORDER BY out_ngay_con_lai ASC; -- Ưu tiên xếp lô nào sắp hết hạn lên trên cùng!
END;
$$;

CREATE OR REPLACE FUNCTION fn_nhap_lo_thuoc(
    p_ma_lo VARCHAR,
    p_ma_thuoc VARCHAR,
    p_ten_thuoc TEXT,
    p_ma_ncc VARCHAR,
    p_so_luong INTEGER,
    p_han_su_dung DATE
) RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    -- 1. Chặn lỗi nhập âm
    IF p_so_luong <= 0 THEN RETURN 'LỖI: Số lượng phải > 0'; END IF;
    
    -- 2. Nếu thuốc chưa tồn tại trong danh mục, tự động thêm mới
    IF NOT EXISTS (SELECT 1 FROM thuoc WHERE ma_thuoc = p_ma_thuoc) THEN
        INSERT INTO thuoc (ma_thuoc, ten_thuoc) VALUES (p_ma_thuoc, p_ten_thuoc);
    END IF;

    -- 3. Xử lý Lô Thuốc (Cộng dồn nếu trùng lô, thêm mới nếu khác lô)
    IF EXISTS (SELECT 1 FROM lo_thuoc WHERE ma_lo = p_ma_lo) THEN
        UPDATE lo_thuoc SET so_luong = so_luong + p_so_luong WHERE ma_lo = p_ma_lo;
        RETURN 'Thành công: Đã cộng dồn thêm ' || p_so_luong || ' vào lô ' || p_ma_lo;
    ELSE
        INSERT INTO lo_thuoc (ma_lo, ma_thuoc, ma_ncc, so_luong, han_su_dung)
        VALUES (p_ma_lo, p_ma_thuoc, COALESCE(p_ma_ncc, 'DHG'), p_so_luong, p_han_su_dung);
        RETURN 'Thành công: Đã tạo lô mới ' || p_ma_lo;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_xuat_lo_thuoc(p_ma_lo VARCHAR) 
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    -- Kiểm tra xem lô thuốc có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM lo_thuoc WHERE ma_lo = p_ma_lo) THEN
        RETURN 'LỖI: Không tìm thấy mã lô này trong kho!';
    END IF;

    -- Thực hiện xóa lô thuốc
    DELETE FROM lo_thuoc WHERE ma_lo = p_ma_lo;
    
    RETURN 'Thành công: Đã xuất (xóa) toàn bộ lô ' || p_ma_lo;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS taikhoan CASCADE;
CREATE TABLE taikhoan (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Đặt is_active = true cho tất cả user (trừ khi bạn muốn admin1 active)
UPDATE taikhoan SET is_active = true WHERE is_active IS NULL OR is_active = false;

-- Đặt created_at = thời điểm hiện tại nếu đang NULL
UPDATE taikhoan SET created_at = NOW() WHERE created_at IS NULL;

UPDATE taikhoan SET is_active = true, created_at = NOW() WHERE username = 'test1';

CREATE OR REPLACE FUNCTION fn_register(
    p_username VARCHAR,
    p_password TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    special_chars TEXT := '!@#$%^&*()_+-=[]{};:''",.<>/?\|';
    has_special BOOLEAN;
BEGIN
    -- 1. Kiểm tra username không được null hoặc rỗng
    IF p_username IS NULL OR LENGTH(TRIM(p_username)) = 0 THEN
        RETURN 'LỖI: Tên đăng nhập không được để trống';
    END IF;

    -- 2. Kiểm tra độ dài username (ít nhất 5 ký tự)
    IF LENGTH(p_username) < 5 THEN
        RETURN 'LỖI: Tên đăng nhập phải có ít nhất 5 ký tự';
    END IF;

    -- 3. Kiểm tra username chỉ chứa chữ cái và số (dùng regex an toàn)
    IF p_username !~ '^[A-Za-z0-9]+$' THEN
        RETURN 'LỖI: Tên đăng nhập chỉ được chứa chữ cái và số, không ký tự đặc biệt';
    END IF;

    -- 4. Kiểm tra mật khẩu không được null hoặc rỗng
    IF p_password IS NULL OR LENGTH(TRIM(p_password)) = 0 THEN
        RETURN 'LỖI: Mật khẩu không được để trống';
    END IF;

    -- 5. Kiểm tra độ dài mật khẩu (ít nhất 8 ký tự)
    IF LENGTH(p_password) < 8 THEN
        RETURN 'LỖI: Mật khẩu phải có ít nhất 8 ký tự';
    END IF;

    -- 6. Kiểm tra mật khẩu có ít nhất 1 ký tự đặc biệt (kiểm tra từng ký tự)
    has_special := FALSE;
    FOR i IN 1..LENGTH(p_password) LOOP
        IF POSITION(SUBSTRING(p_password, i, 1) IN special_chars) > 0 THEN
            has_special := TRUE;
            EXIT;
        END IF;
    END LOOP;

    IF NOT has_special THEN
        RETURN 'LỖI: Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (ví dụ: !@#$%^&*)';
    END IF;

    -- 7. Kiểm tra username đã tồn tại chưa
    IF EXISTS (SELECT 1 FROM taikhoan WHERE username = p_username) THEN
        RETURN 'LỖI: Tên đăng nhập đã tồn tại';
    END IF;

    -- 8. Nếu tất cả ok, thêm tài khoản mới
    INSERT INTO taikhoan (username, password_hash, is_active, is_admin, created_at)
    VALUES (p_username, crypt(p_password, gen_salt('bf')), true, false, NOW());

    RETURN 'Đăng ký thành công!';
END;
$$;

CREATE OR REPLACE FUNCTION fn_login(
    p_username VARCHAR,
    p_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_user taikhoan%ROWTYPE;
    v_result JSON;
BEGIN
    SELECT * INTO v_user
    FROM taikhoan
    WHERE username = p_username;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Sai tên đăng nhập hoặc mật khẩu');
    END IF;

    IF NOT (v_user.password_hash = crypt(p_password, v_user.password_hash)) THEN
        RETURN json_build_object('success', false, 'message', 'Sai tên đăng nhập hoặc mật khẩu');
    END IF;

    IF v_user.is_active = false THEN
        RETURN json_build_object('success', false, 'message', 'Tài khoản đã bị khóa');
    END IF;

    -- Trả về thông tin user (không trả mật khẩu)
    RETURN json_build_object(
        'success', true,
        'username', v_user.username,
        'is_admin', v_user.is_admin,
        'is_active', v_user.is_active
    );
END;
$$;

-- DROP FUNCTION fn_get_all_users

DROP FUNCTION IF EXISTS fn_get_all_users(VARCHAR);

DROP FUNCTION IF EXISTS fn_get_all_users(VARCHAR);

CREATE OR REPLACE FUNCTION fn_get_all_users(p_admin_username VARCHAR)
RETURNS TABLE(
    username VARCHAR,
    is_active BOOLEAN,
    is_admin BOOLEAN,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM taikhoan WHERE taikhoan.username = p_admin_username AND taikhoan.is_admin = true) THEN
        RAISE EXCEPTION 'Chỉ admin mới được xem danh sách tài khoản';
    END IF;

    RETURN QUERY
    SELECT t.username, t.is_active, t.is_admin, t.created_at
    FROM taikhoan t
    ORDER BY t.id;
END;
$$;

SELECT * FROM fn_get_all_users('admin1');

CREATE OR REPLACE FUNCTION fn_toggle_user_active(
    p_admin_username VARCHAR,
    p_target_username VARCHAR
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_status BOOLEAN;
BEGIN
    -- Kiểm tra quyền admin (dùng tên bảng cho rõ)
    IF NOT EXISTS (SELECT 1 FROM taikhoan WHERE taikhoan.username = p_admin_username AND taikhoan.is_admin = true) THEN
        RETURN 'LỖI: Bạn không có quyền thực hiện thao tác này';
    END IF;

    -- Không cho phép vô hiệu hóa chính admin đang thao tác
    IF p_admin_username = p_target_username THEN
        RETURN 'LỖI: Bạn không thể khóa chính tài khoản admin của mình';
    END IF;

    -- Lấy trạng thái hiện tại
    SELECT is_active INTO v_current_status
    FROM taikhoan
    WHERE username = p_target_username;

    IF NOT FOUND THEN
        RETURN 'LỖI: Tài khoản không tồn tại';
    END IF;

    -- Đảo trạng thái
    UPDATE taikhoan
    SET is_active = NOT v_current_status
    WHERE username = p_target_username;

    RETURN 'Thành công: Đã ' || CASE WHEN NOT v_current_status THEN 'mở khóa' ELSE 'vô hiệu hóa' END || ' tài khoản ' || p_target_username;
END;
$$;

-- Xóa nếu đã tồn tại để tránh trùng
-- DELETE FROM taikhoan WHERE username = 'admin1';

INSERT INTO taikhoan (username, password_hash, is_admin, is_active)
VALUES ('admin1', crypt('admin1', gen_salt('bf')), true, true);

SELECT username, is_active, created_at FROM taikhoan;

SELECT * FROM fn_get_all_users('admin1');