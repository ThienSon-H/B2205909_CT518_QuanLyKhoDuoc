-- =============================================
-- FILE: 02_functions.sql
-- Mô tả: Toàn bộ hàm nghiệp vụ (Database as Processor)
-- Đã tích hợp: kiểm tra trạng thái active, ghi log lịch sử
-- =============================================

\encoding UTF8

-- =============================================
-- HÀM TIỆN ÍCH CHUNG
-- =============================================

-- Kiểm tra tài khoản có tồn tại và đang active không
CREATE OR REPLACE FUNCTION fn_check_user_active(p_username VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM taikhoan
        WHERE username = p_username AND is_active = true
    ) THEN
        RETURN FALSE;
    END IF;
    RETURN TRUE;
END;
$$;

-- =============================================
-- A. QUẢN LÝ THUỐC & KHO
-- =============================================

-- Lấy danh sách thuốc (không dùng trong dashboard chính)
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

-- Dashboard kho (FEFO) – có kiểm tra active, hỗ trợ tìm kiếm và lọc
CREATE OR REPLACE FUNCTION fn_get_dashboard_kho(
    p_search VARCHAR DEFAULT NULL,
    p_trang_thai VARCHAR DEFAULT NULL,
    p_username VARCHAR DEFAULT NULL
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
    -- Kiểm tra quyền truy cập
    IF NOT fn_check_user_active(p_username) THEN
        RAISE EXCEPTION 'Tài khoản không tồn tại hoặc đã bị khóa';
    END IF;

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
        (l.han_su_dung - CURRENT_DATE)::INTEGER
    FROM lo_thuoc l
    JOIN thuoc t ON l.ma_thuoc = t.ma_thuoc
    LEFT JOIN nhom_thuoc nt ON t.ma_nhom = nt.ma_nhom
    LEFT JOIN nha_cung_cap ncc ON l.ma_ncc = ncc.ma_ncc
    WHERE 
        (v_search_pattern IS NULL 
         OR t.ma_thuoc ILIKE v_search_pattern 
         OR t.ten_thuoc ILIKE v_search_pattern 
         OR l.ma_lo ILIKE v_search_pattern)
        AND (
            p_trang_thai IS NULL OR p_trang_thai = '' OR
            (p_trang_thai = 'con_han' AND (l.han_su_dung - CURRENT_DATE) >= 180) OR
            (p_trang_thai = 'can_date' AND (l.han_su_dung - CURRENT_DATE) BETWEEN 0 AND 179) OR
            (p_trang_thai = 'het_han' AND (l.han_su_dung - CURRENT_DATE) < 0)
        )
    ORDER BY (l.han_su_dung - CURRENT_DATE) ASC;
END;
$$;

-- Nhập lô thuốc – có kiểm tra active và ghi log
CREATE OR REPLACE FUNCTION fn_nhap_lo_thuoc(
    p_ma_lo VARCHAR,
    p_ma_thuoc VARCHAR,
    p_ten_thuoc TEXT,
    p_ma_ncc VARCHAR,
    p_so_luong INTEGER,
    p_han_su_dung DATE,
    p_nguoi_thuc_hien VARCHAR DEFAULT NULL,
    p_ma_nhom VARCHAR DEFAULT NULL  -- thêm tham số nhóm
) RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    v_so_luong_cu INTEGER;
BEGIN
    IF p_nguoi_thuc_hien IS NOT NULL AND NOT fn_check_user_active(p_nguoi_thuc_hien) THEN
        RETURN 'LỖI: Tài khoản của bạn không tồn tại hoặc đã bị khóa';
    END IF;

    IF p_so_luong <= 0 THEN
        RETURN 'LỖI: Số lượng phải > 0';
    END IF;
    
    -- Tự động thêm thuốc nếu chưa có
    IF NOT EXISTS (SELECT 1 FROM thuoc WHERE ma_thuoc = p_ma_thuoc) THEN
        INSERT INTO thuoc (ma_thuoc, ten_thuoc, ma_nhom)
        VALUES (p_ma_thuoc, p_ten_thuoc, p_ma_nhom);
    ELSE
        -- Nếu thuốc đã tồn tại và có truyền nhóm mới, cập nhật nhóm
        IF p_ma_nhom IS NOT NULL THEN
            UPDATE thuoc SET ma_nhom = p_ma_nhom, ten_thuoc = p_ten_thuoc
            WHERE ma_thuoc = p_ma_thuoc;
        END IF;
    END IF;

    -- Xử lý lô
    IF EXISTS (SELECT 1 FROM lo_thuoc WHERE ma_lo = p_ma_lo) THEN
        SELECT so_luong INTO v_so_luong_cu FROM lo_thuoc WHERE ma_lo = p_ma_lo;
        UPDATE lo_thuoc SET so_luong = so_luong + p_so_luong WHERE ma_lo = p_ma_lo;
        
        INSERT INTO lich_su_nhap_xuat (ma_lo, ma_thuoc, loai_giao_dich, so_luong_thay_doi, nguoi_thuc_hien, ghi_chu)
        VALUES (p_ma_lo, p_ma_thuoc, 'NHAP', p_so_luong, p_nguoi_thuc_hien, 'Cộng dồn vào lô hiện có');
        
        RETURN 'Thành công: Đã cộng dồn thêm ' || p_so_luong || ' vào lô ' || p_ma_lo;
    ELSE
        INSERT INTO lo_thuoc (ma_lo, ma_thuoc, ma_ncc, so_luong, han_su_dung)
        VALUES (p_ma_lo, p_ma_thuoc, COALESCE(p_ma_ncc, 'DHG'), p_so_luong, p_han_su_dung);
        
        INSERT INTO lich_su_nhap_xuat (ma_lo, ma_thuoc, loai_giao_dich, so_luong_thay_doi, nguoi_thuc_hien, ghi_chu)
        VALUES (p_ma_lo, p_ma_thuoc, 'NHAP', p_so_luong, p_nguoi_thuc_hien, 'Tạo lô mới');
        
        RETURN 'Thành công: Đã tạo lô mới ' || p_ma_lo;
    END IF;
END;
$$;

-- Xuất lô thuốc – có kiểm tra active và ghi log
CREATE OR REPLACE FUNCTION fn_xuat_lo_thuoc(p_ma_lo VARCHAR, p_nguoi_thuc_hien VARCHAR DEFAULT NULL)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    v_so_luong INTEGER;
    v_ma_thuoc VARCHAR;
BEGIN
    -- Kiểm tra quyền
    IF p_nguoi_thuc_hien IS NOT NULL AND NOT fn_check_user_active(p_nguoi_thuc_hien) THEN
        RETURN 'LỖI: Tài khoản của bạn không tồn tại hoặc đã bị khóa';
    END IF;

    SELECT so_luong, ma_thuoc INTO v_so_luong, v_ma_thuoc
    FROM lo_thuoc WHERE ma_lo = p_ma_lo;
    
    IF NOT FOUND THEN
        RETURN 'LỖI: Không tìm thấy mã lô này trong kho!';
    END IF;

    INSERT INTO lich_su_nhap_xuat (ma_lo, ma_thuoc, loai_giao_dich, so_luong_thay_doi, nguoi_thuc_hien, ghi_chu)
    VALUES (p_ma_lo, v_ma_thuoc, 'XUAT', v_so_luong, p_nguoi_thuc_hien, 'Xuất toàn bộ lô');

    DELETE FROM lo_thuoc WHERE ma_lo = p_ma_lo;
    
    RETURN 'Thành công: Đã xuất (xóa) toàn bộ lô ' || p_ma_lo;
END;
$$;

-- Báo cáo tổng tồn kho – có kiểm tra active
CREATE OR REPLACE FUNCTION fn_bao_cao_ton_kho(p_username VARCHAR DEFAULT NULL)
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
    IF NOT fn_check_user_active(p_username) THEN
        RAISE EXCEPTION 'Tài khoản không tồn tại hoặc đã bị khóa';
    END IF;

    RETURN QUERY
    SELECT
        t.ma_thuoc,
        t.ten_thuoc,
        COALESCE(nt.ten_nhom, 'Chưa phân nhóm'),
        COALESCE(SUM(l.so_luong), 0)::BIGINT,
        COUNT(l.ma_lo)::INTEGER,
        MIN(l.han_su_dung),
        (MIN(l.han_su_dung) - CURRENT_DATE)::INTEGER
    FROM thuoc t
    LEFT JOIN lo_thuoc l ON t.ma_thuoc = l.ma_thuoc
    LEFT JOIN nhom_thuoc nt ON t.ma_nhom = nt.ma_nhom
    GROUP BY t.ma_thuoc, t.ten_thuoc, nt.ten_nhom
    ORDER BY ngay_con_lai ASC NULLS LAST;
END;
$$;

-- Lịch sử nhập xuất – có kiểm tra active
CREATE OR REPLACE FUNCTION fn_get_lich_su_nhap_xuat(p_username VARCHAR DEFAULT NULL)
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
    IF NOT fn_check_user_active(p_username) THEN
        RAISE EXCEPTION 'Tài khoản không tồn tại hoặc đã bị khóa';
    END IF;

    RETURN QUERY
    SELECT id, ma_lo, ma_thuoc, loai_giao_dich, so_luong_thay_doi,
           nguoi_thuc_hien, thoi_gian, ghi_chu
    FROM lich_su_nhap_xuat
    ORDER BY thoi_gian DESC;
END;
$$;

-- =============================================
-- QUẢN LÝ NHÓM THUỐC
-- =============================================

-- Lấy danh sách nhóm thuốc (chỉ admin)
CREATE OR REPLACE FUNCTION fn_get_all_nhom_thuoc(p_admin_username VARCHAR)
RETURNS TABLE(
    out_ma_nhom VARCHAR,
    out_ten_nhom TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM taikhoan WHERE username = p_admin_username AND is_admin = true AND is_active = true) THEN
        RAISE EXCEPTION 'Chỉ admin mới được xem danh sách nhóm thuốc';
    END IF;

    RETURN QUERY
    SELECT ma_nhom, ten_nhom
    FROM nhom_thuoc
    ORDER BY ma_nhom;
END;
$$;

-- Thêm nhóm thuốc mới
CREATE OR REPLACE FUNCTION fn_insert_nhom_thuoc(
    p_admin_username VARCHAR,
    p_ma_nhom VARCHAR,
    p_ten_nhom TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM taikhoan WHERE username = p_admin_username AND is_admin = true AND is_active = true) THEN
        RETURN 'LỖI: Bạn không có quyền thêm nhóm thuốc';
    END IF;

    IF p_ma_nhom IS NULL OR LENGTH(TRIM(p_ma_nhom)) = 0 THEN
        RETURN 'LỖI: Mã nhóm không được để trống';
    END IF;

    IF p_ten_nhom IS NULL OR LENGTH(TRIM(p_ten_nhom)) = 0 THEN
        RETURN 'LỖI: Tên nhóm không được để trống';
    END IF;

    IF EXISTS (SELECT 1 FROM nhom_thuoc WHERE ma_nhom = p_ma_nhom) THEN
        RETURN 'LỖI: Mã nhóm đã tồn tại';
    END IF;

    INSERT INTO nhom_thuoc (ma_nhom, ten_nhom)
    VALUES (UPPER(p_ma_nhom), p_ten_nhom);

    RETURN 'Thành công: Đã thêm nhóm ' || p_ten_nhom;
END;
$$;

-- Cập nhật nhóm thuốc
CREATE OR REPLACE FUNCTION fn_update_nhom_thuoc(
    p_admin_username VARCHAR,
    p_ma_nhom VARCHAR,
    p_ten_nhom TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM taikhoan WHERE username = p_admin_username AND is_admin = true AND is_active = true) THEN
        RETURN 'LỖI: Bạn không có quyền sửa nhóm thuốc';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM nhom_thuoc WHERE ma_nhom = p_ma_nhom) THEN
        RETURN 'LỖI: Mã nhóm không tồn tại';
    END IF;

    IF p_ten_nhom IS NULL OR LENGTH(TRIM(p_ten_nhom)) = 0 THEN
        RETURN 'LỖI: Tên nhóm không được để trống';
    END IF;

    UPDATE nhom_thuoc
    SET ten_nhom = p_ten_nhom
    WHERE ma_nhom = p_ma_nhom;

    RETURN 'Thành công: Đã cập nhật nhóm ' || p_ten_nhom;
END;
$$;

-- Xóa nhóm thuốc
CREATE OR REPLACE FUNCTION fn_delete_nhom_thuoc(
    p_admin_username VARCHAR,
    p_ma_nhom VARCHAR
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM taikhoan WHERE username = p_admin_username AND is_admin = true AND is_active = true) THEN
        RETURN 'LỖI: Bạn không có quyền xóa nhóm thuốc';
    END IF;

    IF EXISTS (SELECT 1 FROM thuoc WHERE ma_nhom = p_ma_nhom) THEN
        RETURN 'LỖI: Không thể xóa nhóm vì vẫn còn thuốc thuộc nhóm này';
    END IF;

    DELETE FROM nhom_thuoc WHERE ma_nhom = p_ma_nhom;
    IF NOT FOUND THEN
        RETURN 'LỖI: Mã nhóm không tồn tại';
    END IF;

    RETURN 'Thành công: Đã xóa nhóm ' || p_ma_nhom;
END;
$$;

-- =============================================
-- QUẢN LÝ NHÀ CUNG CẤP
-- =============================================

-- Lấy danh sách nhà cung cấp (chỉ admin)
CREATE OR REPLACE FUNCTION fn_get_all_nha_cung_cap(p_admin_username VARCHAR)
RETURNS TABLE(
    out_ma_ncc VARCHAR,
    out_ten_ncc TEXT,
    out_so_dien_thoai VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM taikhoan WHERE username = p_admin_username AND is_admin = true AND is_active = true) THEN
        RAISE EXCEPTION 'Chỉ admin mới được xem danh sách nhà cung cấp';
    END IF;

    RETURN QUERY
    SELECT ma_ncc, ten_ncc, so_dien_thoai
    FROM nha_cung_cap
    ORDER BY ma_ncc;
END;
$$;

-- Thêm nhà cung cấp mới
CREATE OR REPLACE FUNCTION fn_insert_nha_cung_cap(
    p_admin_username VARCHAR,
    p_ma_ncc VARCHAR,
    p_ten_ncc TEXT,
    p_so_dien_thoai VARCHAR DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM taikhoan WHERE username = p_admin_username AND is_admin = true AND is_active = true) THEN
        RETURN 'LỖI: Bạn không có quyền thêm nhà cung cấp';
    END IF;

    IF p_ma_ncc IS NULL OR LENGTH(TRIM(p_ma_ncc)) = 0 THEN
        RETURN 'LỖI: Mã NCC không được để trống';
    END IF;

    IF p_ten_ncc IS NULL OR LENGTH(TRIM(p_ten_ncc)) = 0 THEN
        RETURN 'LỖI: Tên NCC không được để trống';
    END IF;

    IF EXISTS (SELECT 1 FROM nha_cung_cap WHERE ma_ncc = p_ma_ncc) THEN
        RETURN 'LỖI: Mã NCC đã tồn tại';
    END IF;

    INSERT INTO nha_cung_cap (ma_ncc, ten_ncc, so_dien_thoai)
    VALUES (UPPER(p_ma_ncc), p_ten_ncc, p_so_dien_thoai);

    RETURN 'Thành công: Đã thêm NCC ' || p_ten_ncc;
END;
$$;

-- Cập nhật nhà cung cấp
CREATE OR REPLACE FUNCTION fn_update_nha_cung_cap(
    p_admin_username VARCHAR,
    p_ma_ncc VARCHAR,
    p_ten_ncc TEXT,
    p_so_dien_thoai VARCHAR DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM taikhoan WHERE username = p_admin_username AND is_admin = true AND is_active = true) THEN
        RETURN 'LỖI: Bạn không có quyền sửa NCC';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM nha_cung_cap WHERE ma_ncc = p_ma_ncc) THEN
        RETURN 'LỖI: Mã NCC không tồn tại';
    END IF;

    IF p_ten_ncc IS NULL OR LENGTH(TRIM(p_ten_ncc)) = 0 THEN
        RETURN 'LỖI: Tên NCC không được để trống';
    END IF;

    UPDATE nha_cung_cap
    SET ten_ncc = p_ten_ncc,
        so_dien_thoai = p_so_dien_thoai
    WHERE ma_ncc = p_ma_ncc;

    RETURN 'Thành công: Đã cập nhật NCC ' || p_ten_ncc;
END;
$$;

-- Xóa nhà cung cấp
CREATE OR REPLACE FUNCTION fn_delete_nha_cung_cap(
    p_admin_username VARCHAR,
    p_ma_ncc VARCHAR
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM taikhoan WHERE username = p_admin_username AND is_admin = true AND is_active = true) THEN
        RETURN 'LỖI: Bạn không có quyền xóa NCC';
    END IF;

    IF EXISTS (SELECT 1 FROM lo_thuoc WHERE ma_ncc = p_ma_ncc) THEN
        RETURN 'LỖI: Không thể xóa NCC vì vẫn còn lô thuốc liên kết';
    END IF;

    DELETE FROM nha_cung_cap WHERE ma_ncc = p_ma_ncc;
    IF NOT FOUND THEN
        RETURN 'LỖI: Mã NCC không tồn tại';
    END IF;

    RETURN 'Thành công: Đã xóa NCC ' || p_ma_ncc;
END;
$$;

-- Function lấy danh sách nhà cung cấp (cho mọi user active)
CREATE OR REPLACE FUNCTION fn_get_nha_cung_cap_public(p_username VARCHAR DEFAULT NULL)
RETURNS TABLE(out_ma_ncc VARCHAR, out_ten_ncc TEXT, out_so_dien_thoai VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT fn_check_user_active(p_username) THEN
        RAISE EXCEPTION 'Tài khoản không tồn tại hoặc đã bị khóa';
    END IF;
    RETURN QUERY
    SELECT ma_ncc, ten_ncc, so_dien_thoai
    FROM nha_cung_cap
    ORDER BY ma_ncc;
END;
$$;

-- Function lấy danh sách nhóm thuốc (cho mọi user active)
CREATE OR REPLACE FUNCTION fn_get_nhom_thuoc_public(p_username VARCHAR DEFAULT NULL)
RETURNS TABLE(out_ma_nhom VARCHAR, out_ten_nhom TEXT)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT fn_check_user_active(p_username) THEN
        RAISE EXCEPTION 'Tài khoản không tồn tại hoặc đã bị khóa';
    END IF;
    RETURN QUERY
    SELECT ma_nhom, ten_nhom
    FROM nhom_thuoc
    ORDER BY ma_nhom;
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

CREATE OR REPLACE FUNCTION fn_get_all_users(p_admin_username VARCHAR)
RETURNS TABLE(
    out_username VARCHAR,
    out_is_active BOOLEAN,
    out_is_admin BOOLEAN,
    out_created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM taikhoan WHERE username = p_admin_username AND is_admin = true AND is_active = true) THEN
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
    IF NOT EXISTS (SELECT 1 FROM taikhoan WHERE username = p_admin_username AND is_admin = true) THEN
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

-- Function đổi mật khẩu
CREATE OR REPLACE FUNCTION fn_change_password(
    p_username VARCHAR,
    p_old_password TEXT,
    p_new_password TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_user taikhoan%ROWTYPE;
    special_chars TEXT := '!@#$%^&*()_+-=[]{};:''",.<>/?\|';
    has_special BOOLEAN;
BEGIN
    -- 1. Kiểm tra user tồn tại và đang active
    SELECT * INTO v_user
    FROM taikhoan
    WHERE username = p_username AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN 'LỖI: Tài khoản không tồn tại hoặc đã bị khóa';
    END IF;

    -- 2. Xác thực mật khẩu cũ
    IF NOT (v_user.password_hash = crypt(p_old_password, v_user.password_hash)) THEN
        RETURN 'LỖI: Mật khẩu cũ không chính xác';
    END IF;

    -- 3. Validate mật khẩu mới (giống fn_register)
    IF p_new_password IS NULL OR LENGTH(TRIM(p_new_password)) = 0 THEN
        RETURN 'LỖI: Mật khẩu mới không được để trống';
    END IF;

    IF LENGTH(p_new_password) < 8 THEN
        RETURN 'LỖI: Mật khẩu mới phải có ít nhất 8 ký tự';
    END IF;

    -- Kiểm tra ký tự đặc biệt
    has_special := FALSE;
    FOR i IN 1..LENGTH(p_new_password) LOOP
        IF POSITION(SUBSTRING(p_new_password, i, 1) IN special_chars) > 0 THEN
            has_special := TRUE;
            EXIT;
        END IF;
    END LOOP;

    IF NOT has_special THEN
        RETURN 'LỖI: Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*)';
    END IF;

    -- 4. Cập nhật mật khẩu mới
    UPDATE taikhoan
    SET password_hash = crypt(p_new_password, gen_salt('bf'))
    WHERE username = p_username;

    RETURN 'Thành công: Đã đổi mật khẩu cho tài khoản ' || p_username;
END;
$$;

-- DROP FUNCTION fn_get_all_users(p_admin_username VARCHAR)