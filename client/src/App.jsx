import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountManagementPage from './pages/AccountManagementPage';
import axios from 'axios';

// Component Navbar (chỉ hiện khi đã login)
function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid">
        <span className="navbar-brand">🏥 Quản lý Kho Dược</span>
        <div className="ms-auto d-flex gap-3 align-items-center">
          <span className="text-white">Xin chào, {user.username}</span>
          {user.isAdmin && (
            <Link to="/admin/users" className="btn btn-outline-warning btn-sm">
              QLTK
            </Link>
          )}
          <button onClick={logout} className="btn btn-outline-light btn-sm">
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
}

// Component Dashboard (nội dung chính quản lý kho)
function DashboardContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    maLo: '', maThuoc: '', tenThuoc: '', maNcc: 'DHG', soLuong: '', hanSuDung: ''
  });

  const DASHBOARD_URL = 'https://localhost:7122/api/Thuoc/dashboard';
  const IMPORT_URL = 'https://localhost:7122/api/Thuoc/nhap-lo';
  const EXPORT_URL = 'https://localhost:7122/api/Thuoc/xuat-lo';

  const fetchDashboard = () => {
    axios.get(DASHBOARD_URL)
      .then(res => { setItems(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchDashboard(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await axios.post(IMPORT_URL, form);
      if (res.data.message.includes('LỖI')) alert(res.data.message);
      else {
        alert(res.data.message);
        setForm({ maLo: '', maThuoc: '', tenThuoc: '', maNcc: 'DHG', soLuong: '', hanSuDung: '' });
        fetchDashboard();
      }
    } catch (err) { alert("Lỗi kết nối server khi nhập kho!"); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (maLo) => {
    if (!window.confirm(`⚠️ Xuất (xóa) lô ${maLo}? Không thể hoàn tác.`)) return;
    try {
      const res = await axios.delete(`${EXPORT_URL}/${maLo}`);
      if (res.data.message.includes('LỖI')) alert(res.data.message);
      else { alert(res.data.message); fetchDashboard(); }
    } catch (err) { alert("Lỗi kết nối server khi xuất kho!"); }
  };

  if (loading) return <div className="container mt-5 text-center"><div className="spinner-border text-primary"></div> Đang tải dữ liệu...</div>;

  return (
    <div className="container-fluid py-4 px-4 bg-light min-vh-100">
      <h2 className="text-primary fw-bold mb-4 text-center">🏥 Hệ Thống Quản Lý Kho Dược Toàn Diện</h2>

      <div className="card shadow border-0 mb-5">
        <div className="card-header bg-success text-white fw-bold">Tạo Phiếu Nhập Lô Mới</div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} className="row g-4 align-items-end">
            <div className="col-md-2">
              <label className="form-label text-secondary fw-bold">Mã Lô</label>
              <input className="form-control" placeholder="VD: LO-005" value={form.maLo} onChange={e => setForm({...form, maLo: e.target.value.toUpperCase()})} required />
            </div>
            <div className="col-md-2">
              <label className="form-label text-secondary fw-bold">Mã Thuốc</label>
              <input className="form-control" placeholder="VD: PARA" value={form.maThuoc} onChange={e => setForm({...form, maThuoc: e.target.value.toUpperCase()})} required />
            </div>
            <div className="col-md-3">
              <label className="form-label text-secondary fw-bold">Tên Thuốc</label>
              <input className="form-control" placeholder="Nhập tên thuốc..." value={form.tenThuoc} onChange={e => setForm({...form, tenThuoc: e.target.value})} required />
            </div>
            <div className="col-md-2">
              <label className="form-label text-secondary fw-bold">Nhà Cung Cấp</label>
              <select className="form-select" value={form.maNcc} onChange={e => setForm({...form, maNcc: e.target.value})}>
                <option value="DHG">Dược Hậu Giang</option>
                <option value="SANOFI">Sanofi Việt Nam</option>
              </select>
            </div>
            <div className="col-md-1">
              <label className="form-label text-secondary fw-bold">S.Lượng</label>
              <input type="number" className="form-control" min="1" value={form.soLuong} onChange={e => setForm({...form, soLuong: parseInt(e.target.value) || ''})} required />
            </div>
            <div className="col-md-2">
              <label className="form-label text-secondary fw-bold">Hạn Sử Dụng</label>
              <input type="date" className="form-control" value={form.hanSuDung} onChange={e => setForm({...form, hanSuDung: e.target.value})} required />
            </div>
            <div className="col-12 d-flex justify-content-end">
              <button type="submit" className="btn btn-success px-5" disabled={isSubmitting}>
                {isSubmitting ? 'Đang xử lý...' : 'Lưu Phiếu Nhập'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow border-0">
        <div className="card-header bg-dark text-white d-flex justify-content-between">
          <span>Bảng Kê Tồn Kho & Xuất Kho</span>
          <span className="badge bg-danger">Ưu tiên hiển thị thuốc Cận Date</span>
        </div>
        <div className="card-body p-0">
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Mã Thuốc</th><th>Tên Thuốc (Nhóm)</th><th>Mã Lô</th><th>Nhà Cung Cấp</th>
                <th>Tồn Kho</th><th>Hạn Sử Dụng</th><th>Tình Trạng</th><th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.maLo} className={i.ngayConLai < 180 ? "table-danger" : ""}>
                  <td className="text-center"><span className="badge bg-secondary">{i.maThuoc}</span></td>
                  <td><strong>{i.tenThuoc}</strong><br/><small>{i.tenNhom}</small></td>
                  <td className="text-center"><span className="badge border border-dark bg-white">{i.maLo}</span></td>
                  <td>{i.tenNcc}</td>
                  <td className="text-center fw-bold text-success">{i.soLuong}</td>
                  <td className="text-center">{new Date(i.hanSuDung).toLocaleDateString('vi-VN')}</td>
                  <td className="text-center">
                    {i.ngayConLai < 0 ? <span className="badge bg-dark">Hết hạn</span> :
                     i.ngayConLai < 180 ? <span className="badge bg-danger">Cận date ({i.ngayConLai} ngày)</span> :
                     <span className="badge bg-success">An toàn ({i.ngayConLai} ngày)</span>}
                  </td>
                  <td className="text-center">
                    <button className="btn btn-outline-danger btn-sm w-100" onClick={() => handleDelete(i.maLo)}>Xuất Kho</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Component App chính với Router
function AppRouter() {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Đang tải ứng dụng...</div>;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/admin/users" element={user?.isAdmin ? <AccountManagementPage /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <DashboardContent /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}

// Xuất App được bọc trong AuthProvider và BrowserRouter
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;