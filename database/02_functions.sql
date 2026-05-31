-- =============================================
-- FILE: 02_functions.sql
-- Mô tả: Toàn bộ hàm nghiệp vụ (Database as Processor)
-- =============================================

-- =============================================
-- A. QUẢN LÝ THUỐC & KHO
-- =============================================

-- Lấy danh sách thuốc (không dùng trong dashboard chính)

\encoding UTF8

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
    RETURN QUERY 
    SELECT ma_thuoc, ten_thuoc, so_luong_ton, don_vi_tinh 
    FROM thuoc
    ORDER BY ten_thuoc ASC;
END;
$$;

-- Thêm/cập nhật thuốc đơn lẻ
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
    IF p_so_luong <= 0 THEN
        RETURN 'LỖI: Số lượng nhập vào phải lớn hơn 0!';
    END IF;

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

-- Cập nhật function fn_get_dashboard_kho hỗ trợ tìm kiếm và lọc
CREATE OR REPLACE FUNCTION fn_get_dashboard_kho(
    p_search VARCHAR DEFAULT NULL,
    p_trang_thai VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    out_ma_thuoc VARCHAR,
    out_ten_thuoc TEXT,
    out_ten_nhom TEXT,
    out_ma_lo VARCHAR,
    out_ten_ncc TEXT,
    out_so_luong INTEGER,
    out_han_su_dung DATE,
    out_ngay_con_lai INTEGER
) LANGUAGE plpgsql AS $$
DECLARE
    v_search_pattern VARCHAR;
BEGIN
    -- Chuẩn bị pattern tìm kiếm (không phân biệt hoa thường)
    IF p_search IS NOT NULL AND LENGTH(TRIM(p_search)) > 0 THEN
        v_search_pattern := '%' || TRIM(p_search) || '%';
    END IF;

    RETURN QUERY
    SELECT 
        t.ma_thuoc,
        t.ten_thuoc,
        COALESCE(nt.ten_nhom, 'Chưa phân nhóm'),
        l.ma_lo,
        COALESCE(ncc.ten_ncc, 'Khác'),
        l.so_luong,
        l.han_su_dung,
        (l.han_su_dung - CURRENT_DATE)::INTEGER AS out_ngay_con_lai
    FROM lo_thuoc l
    JOIN thuoc t ON l.ma_thuoc = t.ma_thuoc
    LEFT JOIN nhom_thuoc nt ON t.ma_nhom = nt.ma_nhom
    LEFT JOIN nha_cung_cap ncc ON l.ma_ncc = ncc.ma_ncc
    WHERE 
        -- Điều kiện tìm kiếm (nếu có)
        (v_search_pattern IS NULL 
         OR t.ma_thuoc ILIKE v_search_pattern 
         OR t.ten_thuoc ILIKE v_search_pattern 
         OR l.ma_lo ILIKE v_search_pattern)
        -- Điều kiện lọc theo trạng thái (nếu có)
        AND (
            p_trang_thai IS NULL OR p_trang_thai = '' OR
            (p_trang_thai = 'con_han' AND (l.han_su_dung - CURRENT_DATE) >= 180) OR
            (p_trang_thai = 'can_date' AND (l.han_su_dung - CURRENT_DATE) BETWEEN 0 AND 179) OR
            (p_trang_thai = 'het_han' AND (l.han_su_dung - CURRENT_DATE) < 0)
        )
    ORDER BY out_ngay_con_lai ASC;
END;
$$;

-- Nhập lô thuốc
CREATE OR REPLACE FUNCTION fn_nhap_lo_thuoc(
    p_ma_lo VARCHAR,
    p_ma_thuoc VARCHAR,
    p_ten_thuoc TEXT,
    p_ma_ncc VARCHAR,
    p_so_luong INTEGER,
    p_han_su_dung DATE
) RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    IF p_so_luong <= 0 THEN
        RETURN 'LỖI: Số lượng phải > 0';
    END IF;
    
    -- Tự động thêm thuốc nếu chưa có trong danh mục
    IF NOT EXISTS (SELECT 1 FROM thuoc WHERE ma_thuoc = p_ma_thuoc) THEN
        INSERT INTO thuoc (ma_thuoc, ten_thuoc) VALUES (p_ma_thuoc, p_ten_thuoc);
    END IF;

    -- Cộng dồn nếu trùng mã lô, nếu không tạo mới
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

-- Xuất lô thuốc (xóa lô)
CREATE OR REPLACE FUNCTION fn_xuat_lo_thuoc(p_ma_lo VARCHAR) 
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM lo_thuoc WHERE ma_lo = p_ma_lo) THEN
        RETURN 'LỖI: Không tìm thấy mã lô này trong kho!';
    END IF;

    DELETE FROM lo_thuoc WHERE ma_lo = p_ma_lo;
    RETURN 'Thành công: Đã xuất (xóa) toàn bộ lô ' || p_ma_lo;
END;
$$;

-- =============================================
-- B. QUẢN LÝ TÀI KHOẢN
-- =============================================

-- Đăng ký
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
    IF p_username IS NULL OR LENGTH(TRIM(p_username)) = 0 THEN
        RETURN 'LỖI: Tên đăng nhập không được để trống';
    END IF;

    IF LENGTH(p_username) < 5 THEN
        RETURN 'LỖI: Tên đăng nhập phải có ít nhất 5 ký tự';
    END IF;

    IF p_username !~ '^[A-Za-z0-9]+$' THEN
        RETURN 'LỖI: Tên đăng nhập chỉ được chứa chữ cái và số';
    END IF;

    IF p_password IS NULL OR LENGTH(TRIM(p_password)) = 0 THEN
        RETURN 'LỖI: Mật khẩu không được để trống';
    END IF;

    IF LENGTH(p_password) < 8 THEN
        RETURN 'LỖI: Mật khẩu phải có ít nhất 8 ký tự';
    END IF;

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

    IF EXISTS (SELECT 1 FROM taikhoan WHERE username = p_username) THEN
        RETURN 'LỖI: Tên đăng nhập đã tồn tại';
    END IF;

    INSERT INTO taikhoan (username, password_hash, is_active, is_admin, created_at)
    VALUES (p_username, crypt(p_password, gen_salt('bf')), true, false, NOW());

    RETURN 'Đăng ký thành công!';
END;
$$;

-- Đăng nhập
CREATE OR REPLACE FUNCTION fn_login(
    p_username VARCHAR,
    p_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_user taikhoan%ROWTYPE;
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

    RETURN json_build_object(
        'success', true,
        'username', v_user.username,
        'is_admin', v_user.is_admin,
        'is_active', v_user.is_active
    );
END;
$$;

-- Lấy danh sách người dùng (chỉ admin)
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

-- Vô hiệu hóa / Mở khóa tài khoản
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
    IF NOT EXISTS (SELECT 1 FROM taikhoan WHERE taikhoan.username = p_admin_username AND taikhoan.is_admin = true) THEN
        RETURN 'LỖI: Bạn không có quyền thực hiện thao tác này';
    END IF;

    IF p_admin_username = p_target_username THEN
        RETURN 'LỖI: Bạn không thể khóa chính tài khoản admin của mình';
    END IF;

    SELECT is_active INTO v_current_status
    FROM taikhoan
    WHERE username = p_target_username;

    IF NOT FOUND THEN
        RETURN 'LỖI: Tài khoản không tồn tại';
    END IF;

    UPDATE taikhoan
    SET is_active = NOT v_current_status
    WHERE username = p_target_username;

    RETURN 'Thành công: Đã ' || 
           CASE WHEN NOT v_current_status THEN 'mở khóa' ELSE 'vô hiệu hóa' END || 
           ' tài khoản ' || p_target_username;
END;
$$;

-- DROP FUNCTION IF EXISTS fn_get_dashboard_kho();

-- Function báo cáo tổng tồn kho theo thuốc
CREATE OR REPLACE FUNCTION fn_bao_cao_ton_kho()
RETURNS TABLE (
    out_ma_thuoc VARCHAR,
    out_ten_thuoc TEXT,
    out_ten_nhom TEXT,
    out_tong_so_luong BIGINT,
    out_so_lo INTEGER,
    out_han_som_nhat DATE,
    out_ngay_con_lai INTEGER
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.ma_thuoc,
        t.ten_thuoc,
        COALESCE(nt.ten_nhom, 'Chưa phân nhóm'),
        COALESCE(SUM(l.so_luong), 0)::BIGINT AS tong_so_luong,
        COUNT(l.ma_lo)::INTEGER AS so_lo,
        MIN(l.han_su_dung) AS han_som_nhat,
        (MIN(l.han_su_dung) - CURRENT_DATE)::INTEGER AS ngay_con_lai
    FROM thuoc t
    LEFT JOIN lo_thuoc l ON t.ma_thuoc = l.ma_thuoc
    LEFT JOIN nhom_thuoc nt ON t.ma_nhom = nt.ma_nhom
    GROUP BY t.ma_thuoc, t.ten_thuoc, nt.ten_nhom
    ORDER BY ngay_con_lai ASC NULLS LAST; -- Ưu tiên thuốc có lô sắp hết hạn
END;
$$;

-- Cập nhật function nhập lô: thêm tham số người thực hiện, ghi log
CREATE OR REPLACE FUNCTION fn_nhap_lo_thuoc(
    p_ma_lo VARCHAR,
    p_ma_thuoc VARCHAR,
    p_ten_thuoc TEXT,
    p_ma_ncc VARCHAR,
    p_so_luong INTEGER,
    p_han_su_dung DATE,
    p_nguoi_thuc_hien VARCHAR DEFAULT NULL
) RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    v_so_luong_cu INTEGER;
BEGIN
    IF p_so_luong <= 0 THEN
        RETURN 'LỖI: Số lượng phải > 0';
    END IF;
    
    -- Tự động thêm thuốc nếu chưa có
    IF NOT EXISTS (SELECT 1 FROM thuoc WHERE ma_thuoc = p_ma_thuoc) THEN
        INSERT INTO thuoc (ma_thuoc, ten_thuoc) VALUES (p_ma_thuoc, p_ten_thuoc);
    END IF;

    -- Xử lý lô
    IF EXISTS (SELECT 1 FROM lo_thuoc WHERE ma_lo = p_ma_lo) THEN
        SELECT so_luong INTO v_so_luong_cu FROM lo_thuoc WHERE ma_lo = p_ma_lo;
        UPDATE lo_thuoc SET so_luong = so_luong + p_so_luong WHERE ma_lo = p_ma_lo;
        
        -- Ghi log
        INSERT INTO lich_su_nhap_xuat (ma_lo, ma_thuoc, loai_giao_dich, so_luong_thay_doi, nguoi_thuc_hien, ghi_chu)
        VALUES (p_ma_lo, p_ma_thuoc, 'NHAP', p_so_luong, p_nguoi_thuc_hien, 'Cộng dồn vào lô hiện có');
        
        RETURN 'Thành công: Đã cộng dồn thêm ' || p_so_luong || ' vào lô ' || p_ma_lo;
    ELSE
        INSERT INTO lo_thuoc (ma_lo, ma_thuoc, ma_ncc, so_luong, han_su_dung)
        VALUES (p_ma_lo, p_ma_thuoc, COALESCE(p_ma_ncc, 'DHG'), p_so_luong, p_han_su_dung);
        
        -- Ghi log
        INSERT INTO lich_su_nhap_xuat (ma_lo, ma_thuoc, loai_giao_dich, so_luong_thay_doi, nguoi_thuc_hien, ghi_chu)
        VALUES (p_ma_lo, p_ma_thuoc, 'NHAP', p_so_luong, p_nguoi_thuc_hien, 'Tạo lô mới');
        
        RETURN 'Thành công: Đã tạo lô mới ' || p_ma_lo;
    END IF;
END;
$$;

-- Cập nhật function xuất lô: thêm tham số người thực hiện, ghi log trước khi xóa
CREATE OR REPLACE FUNCTION fn_xuat_lo_thuoc(p_ma_lo VARCHAR, p_nguoi_thuc_hien VARCHAR DEFAULT NULL)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    v_so_luong INTEGER;
    v_ma_thuoc VARCHAR;
BEGIN
    -- Lấy thông tin lô trước khi xóa
    SELECT so_luong, ma_thuoc INTO v_so_luong, v_ma_thuoc
    FROM lo_thuoc WHERE ma_lo = p_ma_lo;
    
    IF NOT FOUND THEN
        RETURN 'LỖI: Không tìm thấy mã lô này trong kho!';
    END IF;

    -- Ghi log trước
    INSERT INTO lich_su_nhap_xuat (ma_lo, ma_thuoc, loai_giao_dich, so_luong_thay_doi, nguoi_thuc_hien, ghi_chu)
    VALUES (p_ma_lo, v_ma_thuoc, 'XUAT', v_so_luong, p_nguoi_thuc_hien, 'Xuất toàn bộ lô');

    -- Xóa lô
    DELETE FROM lo_thuoc WHERE ma_lo = p_ma_lo;
    
    RETURN 'Thành công: Đã xuất (xóa) toàn bộ lô ' || p_ma_lo;
END;
$$;


-- Function lấy lịch sử nhập xuất (mới nhất trước)
CREATE OR REPLACE FUNCTION fn_get_lich_su_nhap_xuat()
RETURNS TABLE (
    out_id INTEGER,
    out_ma_lo VARCHAR,
    out_ma_thuoc VARCHAR,
    out_loai_giao_dich VARCHAR,
    out_so_luong_thay_doi INTEGER,
    out_nguoi_thuc_hien VARCHAR,
    out_thoi_gian TIMESTAMP,
    out_ghi_chu TEXT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT id, ma_lo, ma_thuoc, loai_giao_dich, so_luong_thay_doi,
           nguoi_thuc_hien, thoi_gian, ghi_chu
    FROM lich_su_nhap_xuat
    ORDER BY thoi_gian DESC;
END;
$$;