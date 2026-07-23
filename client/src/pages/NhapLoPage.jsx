import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

const IMPORT_URL = 'http://localhost:7122/api/Thuoc/nhap-lo';
const NCC_PUBLIC_URL = 'http://localhost:7122/api/DanhMuc/nha-cung-cap-public';
const NHOM_PUBLIC_URL = 'http://localhost:7122/api/DanhMuc/nhom-thuoc-public';
const THUOC_LIST_URL = 'http://localhost:7122/api/Thuoc/list-public';

function NhapLoPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nhaCungCapList, setNhaCungCapList] = useState([]);
  const [nhomThuocList, setNhomThuocList] = useState([]);
  const [thuocList, setThuocList] = useState([]);
  const [form, setForm] = useState({
    maNcc: '',
    maNhom: '',
    soLuong: '',
    hanSuDung: '',
    nguoiThucHien: user?.username || ''
  });

  // Combobox state
  const [thuocSearch, setThuocSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedThuoc, setSelectedThuoc] = useState(null);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nccRes, nhomRes, thuocRes] = await Promise.all([
          axios.get(NCC_PUBLIC_URL, { params: { username: user?.username } }),
          axios.get(NHOM_PUBLIC_URL, { params: { username: user?.username } }),
          axios.get(THUOC_LIST_URL, { params: { username: user?.username } })
        ]);
        setNhaCungCapList(nccRes.data);
        setNhomThuocList(nhomRes.data);
        setThuocList(thuocRes.data);
        if (nccRes.data.length > 0) {
          setForm(prev => ({ ...prev, maNcc: nccRes.data[0].maNcc }));
        }
        if (nhomRes.data.length > 0) {
          setForm(prev => ({ ...prev, maNhom: nhomRes.data[0].maNhom }));
        }
      } catch (err) {
        addToast('Lỗi tải danh mục', 'error');
      }
    };
    if (user?.username) fetchData();
  }, [user, addToast]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredThuoc = thuocList.filter(t => {
    if (!thuocSearch.trim()) return true;
    const keyword = thuocSearch.toLowerCase();
    return t.maThuoc.toLowerCase().includes(keyword) || t.tenThuoc.toLowerCase().includes(keyword);
  });

  const handleSelectThuoc = (thuoc) => {
    setSelectedThuoc(thuoc);
    setThuocSearch(`${thuoc.tenThuoc} (${thuoc.maThuoc})`);
    setShowDropdown(false);
  };

  const clearSelectedThuoc = () => {
    setSelectedThuoc(null);
    setThuocSearch('');
    if (inputRef.current) inputRef.current.focus();
    setShowDropdown(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedThuoc) {
      addToast('Vui lòng chọn thuốc từ danh sách', 'warning');
      return;
    }

    // Kiểm tra số lượng hợp lệ
    const soLuong = parseInt(form.soLuong);
    if (isNaN(soLuong) || soLuong <= 0) {
      addToast('Vui lòng nhập số lượng hợp lệ', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      // Gửi maLo là chuỗi rỗng để backend tự sinh
      const payload = {
        maLo: '',
        maThuoc: selectedThuoc.maThuoc,
        tenThuoc: selectedThuoc.tenThuoc,
        maNcc: form.maNcc,
        soLuong: soLuong,
        hanSuDung: form.hanSuDung,
        nguoiThucHien: user?.username,
        maNhom: form.maNhom
      };
      const res = await axios.post(IMPORT_URL, payload);
      if (res.data.message.includes('LỖI')) {
        addToast(res.data.message, 'error');
      } else {
        addToast(res.data.message, 'success');
        navigate('/');
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Lỗi kết nối server khi nhập kho!", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper fade-in">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card-custom">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>📦 Tạo Phiếu Nhập Lô Mới</span>
              <Link to="/" className="btn btn-outline-light btn-sm ripple">
                ← Quay lại Dashboard
              </Link>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Chọn thuốc */}
                <div className="row g-4">
                  <div className="col-md-12" ref={wrapperRef}>
                    <div className="form-group-custom" style={{ position: 'relative' }}>
                      <label className="form-label">
                        <span className="label-icon">💊</span> Chọn thuốc
                      </label>
                      <div className="input-with-icon">
                        <span className="input-icon">🔍</span>
                        <input
                          ref={inputRef}
                          type="text"
                          className="form-control-custom"
                          placeholder="Nhập mã hoặc tên thuốc để tìm..."
                          value={thuocSearch}
                          onChange={(e) => {
                            setThuocSearch(e.target.value);
                            if (selectedThuoc && e.target.value === '') clearSelectedThuoc();
                            else setShowDropdown(true);
                          }}
                          onFocus={() => setShowDropdown(true)}
                          autoComplete="off"
                        />
                        {selectedThuoc && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary input-clear-btn"
                            onClick={clearSelectedThuoc}
                            style={{ right: '0.5rem', left: 'auto' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      {showDropdown && !selectedThuoc && (
                        <ul className="searchable-dropdown">
                          {filteredThuoc.length === 0 ? (
                            <li className="px-3 py-2 text-muted" style={{ fontSize: 'var(--md-typescale-caption)' }}>
                              Không tìm thấy thuốc. Hãy thêm trong Quản lý thuốc.
                            </li>
                          ) : (
                            filteredThuoc.map(t => (
                              <li key={t.maThuoc} onClick={() => handleSelectThuoc(t)}>
                                <strong>{t.tenThuoc}</strong> <small className="text-muted">({t.maThuoc})</small>
                              </li>
                            ))
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thông tin thuốc đã chọn */}
                {selectedThuoc && (
                  <div className="row g-4 mt-2">
                    <div className="col-md-6">
                      <div className="form-group-custom">
                        <label className="form-label">Mã Thuốc</label>
                        <input className="form-control-custom" value={selectedThuoc.maThuoc} disabled />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group-custom">
                        <label className="form-label">Tên Thuốc</label>
                        <input className="form-control-custom" value={selectedThuoc.tenThuoc} disabled />
                      </div>
                    </div>
                  </div>
                )}

                {/* Nhà cung cấp - Nhóm thuốc */}
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="form-group-custom">
                      <label className="form-label">
                        <span className="label-icon">🚚</span> Nhà Cung Cấp
                      </label>
                      <select
                        className="form-select-custom"
                        value={form.maNcc}
                        onChange={e => setForm({...form, maNcc: e.target.value})}
                      >
                        {nhaCungCapList.map(ncc => (
                          <option key={ncc.maNcc} value={ncc.maNcc}>
                            {ncc.tenNcc} ({ncc.maNcc})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group-custom">
                      <label className="form-label">
                        <span className="label-icon">📂</span> Nhóm Thuốc
                      </label>
                      <select
                        className="form-select-custom"
                        value={form.maNhom}
                        onChange={e => setForm({...form, maNhom: e.target.value})}
                      >
                        {nhomThuocList.map(nhom => (
                          <option key={nhom.maNhom} value={nhom.maNhom}>
                            {nhom.tenNhom} ({nhom.maNhom})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Số lượng - Hạn sử dụng */}
                <div className="row g-4">
                  <div className="col-md-3">
                    <div className="form-group-custom">
                      <label className="form-label">
                        <span className="label-icon">🔢</span> Số Lượng
                      </label>
                      <input
                        type="number"
                        className="form-control-custom"
                        min="1"
                        value={form.soLuong}
                        onChange={e => setForm({...form, soLuong: parseInt(e.target.value) || ''})}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group-custom">
                      <label className="form-label">
                        <span className="label-icon">📅</span> Hạn Sử Dụng
                      </label>
                      <input
                        type="date"
                        className="form-control-custom"
                        value={form.hanSuDung}
                        onChange={e => setForm({...form, hanSuDung: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <button
                    type="submit"
                    className="btn btn-success-custom px-5 ripple"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">💾</span> Lưu Phiếu Nhập
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NhapLoPage;