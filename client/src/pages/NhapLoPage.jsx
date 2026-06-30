import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const IMPORT_URL = 'https://localhost:7122/api/Thuoc/nhap-lo';
const NCC_PUBLIC_URL = 'https://localhost:7122/api/DanhMuc/nha-cung-cap-public';
const NHOM_PUBLIC_URL = 'https://localhost:7122/api/DanhMuc/nhom-thuoc-public';

function NhapLoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nhaCungCapList, setNhaCungCapList] = useState([]);
  const [nhomThuocList, setNhomThuocList] = useState([]);

  const [form, setForm] = useState({
    maLo: '',
    maThuoc: '',
    tenThuoc: '',
    maNcc: '',
    maNhom: '',
    soLuong: '',
    hanSuDung: '',
    nguoiThucHien: user?.username || ''
  });

  // Lấy danh sách nhà cung cấp và nhóm thuốc
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nccRes, nhomRes] = await Promise.all([
          axios.get(NCC_PUBLIC_URL, { params: { username: user?.username } }),
          axios.get(NHOM_PUBLIC_URL, { params: { username: user?.username } })
        ]);
        setNhaCungCapList(nccRes.data);
        setNhomThuocList(nhomRes.data);
        // Đặt giá trị mặc định nếu có dữ liệu
        if (nccRes.data.length > 0) {
          setForm(prev => ({ ...prev, maNcc: nccRes.data[0].maNcc }));
        }
        if (nhomRes.data.length > 0) {
          setForm(prev => ({ ...prev, maNhom: nhomRes.data[0].maNhom }));
        }
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
      }
    };
    if (user?.username) fetchData();
  }, [user]);

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
                      <input className="form-control-custom w-100" placeholder="VD: LO-005"
                        value={form.maLo}
                        onChange={e => setForm({...form, maLo: e.target.value.toUpperCase()})}
                        required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group-custom">
                      <label className="form-label">Mã Thuốc</label>
                      <input className="form-control-custom w-100" placeholder="VD: PARA"
                        value={form.maThuoc}
                        onChange={e => setForm({...form, maThuoc: e.target.value.toUpperCase()})}
                        required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group-custom">
                      <label className="form-label">Tên Thuốc</label>
                      <input className="form-control-custom w-100" placeholder="Nhập tên thuốc..."
                        value={form.tenThuoc}
                        onChange={e => setForm({...form, tenThuoc: e.target.value})}
                        required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group-custom">
                      <label className="form-label">Nhà Cung Cấp</label>
                      <select className="form-select-custom w-100"
                        value={form.maNcc}
                        onChange={e => setForm({...form, maNcc: e.target.value})}>
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
                      <label className="form-label">Nhóm Thuốc</label>
                      <select className="form-select-custom w-100"
                        value={form.maNhom}
                        onChange={e => setForm({...form, maNhom: e.target.value})}>
                        {nhomThuocList.map(nhom => (
                          <option key={nhom.maNhom} value={nhom.maNhom}>
                            {nhom.tenNhom} ({nhom.maNhom})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group-custom">
                      <label className="form-label">Số Lượng</label>
                      <input type="number" className="form-control-custom w-100" min="1"
                        value={form.soLuong}
                        onChange={e => setForm({...form, soLuong: parseInt(e.target.value) || ''})}
                        required />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group-custom">
                      <label className="form-label">Hạn Sử Dụng</label>
                      <input type="date" className="form-control-custom w-100"
                        value={form.hanSuDung}
                        onChange={e => setForm({...form, hanSuDung: e.target.value})}
                        required />
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