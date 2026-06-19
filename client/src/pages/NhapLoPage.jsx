import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const IMPORT_URL = 'https://localhost:7122/api/Thuoc/nhap-lo';

function NhapLoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    maLo: '',
    maThuoc: '',
    tenThuoc: '',
    maNcc: 'DHG',
    soLuong: '',
    hanSuDung: '',
    nguoiThucHien: user?.username || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        nguoiThucHien: user?.username
      };
      const res = await axios.post(IMPORT_URL, payload);
      if (res.data.message.includes('LỖI')) alert(res.data.message);
      else {
        alert(res.data.message);
        navigate('/');
      }
    } catch (err) {
      alert("Lỗi kết nối server khi nhập kho!");
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
              <Link to="/" className="btn btn-outline-light btn-sm">
                ← Quay lại Dashboard
              </Link>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="form-group-custom">
                      <label className="form-label">Mã Lô</label>
                      <input
                        className="form-control-custom w-100"
                        placeholder="VD: LO-005"
                        value={form.maLo}
                        onChange={e => setForm({...form, maLo: e.target.value.toUpperCase()})}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group-custom">
                      <label className="form-label">Mã Thuốc</label>
                      <input
                        className="form-control-custom w-100"
                        placeholder="VD: PARA"
                        value={form.maThuoc}
                        onChange={e => setForm({...form, maThuoc: e.target.value.toUpperCase()})}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group-custom">
                      <label className="form-label">Tên Thuốc</label>
                      <input
                        className="form-control-custom w-100"
                        placeholder="Nhập tên thuốc..."
                        value={form.tenThuoc}
                        onChange={e => setForm({...form, tenThuoc: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group-custom">
                      <label className="form-label">Nhà Cung Cấp</label>
                      <select
                        className="form-select-custom w-100"
                        value={form.maNcc}
                        onChange={e => setForm({...form, maNcc: e.target.value})}
                      >
                        <option value="DHG">Dược Hậu Giang</option>
                        <option value="SANOFI">Sanofi Việt Nam</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group-custom">
                      <label className="form-label">Số Lượng</label>
                      <input
                        type="number"
                        className="form-control-custom w-100"
                        min="1"
                        value={form.soLuong}
                        onChange={e => setForm({...form, soLuong: parseInt(e.target.value) || ''})}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group-custom">
                      <label className="form-label">Hạn Sử Dụng</label>
                      <input
                        type="date"
                        className="form-control-custom w-100"
                        value={form.hanSuDung}
                        onChange={e => setForm({...form, hanSuDung: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12 d-flex justify-content-end mt-3">
                    <button type="submit" className="btn btn-success-custom px-5" disabled={isSubmitting}>
                      {isSubmitting ? '⏳ Đang xử lý...' : '💾 Lưu Phiếu Nhập'}
                    </button>
                  </div>
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