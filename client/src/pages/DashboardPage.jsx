import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const DASHBOARD_URL = 'https://localhost:7122/api/Thuoc/dashboard';
const EXPORT_URL = 'https://localhost:7122/api/Thuoc/xuat-lo';

function DashboardPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [trangThai, setTrangThai] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(DASHBOARD_URL, {
        params: {
          search: search || undefined,
          trangThai: trangThai || undefined,
          username: user?.username  // gửi username để kiểm tra active
        }
      });
      setItems(res.data);
    } catch (err) {
      console.error(err);
      // Có thể hiển thị lỗi nếu cần
    } finally {
      setLoading(false);
    }
  }, [search, trangThai, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboard();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchDashboard]);

  const handleExport = async (maLo) => {
    if (!window.confirm(`⚠️ Xuất (xóa) lô ${maLo}? Không thể hoàn tác.`)) return;
    try {
      const res = await axios.delete(`${EXPORT_URL}/${maLo}`, {
        params: { nguoiThucHien: user?.username }
      });
      if (res.data.message.includes('LỖI')) alert(res.data.message);
      else { alert(res.data.message); fetchDashboard(); }
    } catch (err) {
      alert("Lỗi kết nối server khi xuất kho!");
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4 fade-in">
      <div className="dashboard-header">
        <h2 className="text-primary fw-bold mb-0">📊 Bảng Tồn Kho Dược Phẩm</h2>
        <Link to="/nhap-lo" className="btn btn-success-custom">
          ➕ Nhập Lô Mới
        </Link>
      </div>

      <div className="card-custom mb-4">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">🔍</span>
                <input
                  type="text"
                  className="form-control-custom border-start-0"
                  placeholder="Tìm theo mã thuốc, tên thuốc hoặc mã lô..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="btn btn-outline-secondary" onClick={() => setSearch('')}>✕</button>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select-custom w-100"
                value={trangThai}
                onChange={(e) => setTrangThai(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="con_han">✅ Còn hạn (&gt; 180 ngày)</option>
                <option value="can_date">⚠️ Cận date (&lt; 180 ngày)</option>
                <option value="het_han">❌ Hết hạn</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-primary-custom w-100" onClick={fetchDashboard}>
                🔄 Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center mt-5 pt-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Đang tải dữ liệu tồn kho...</p>
        </div>
      ) : (
        <div className="card-custom">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Danh sách lô thuốc (FEFO) {items.length > 0 && `- ${items.length} lô`}</span>
            <span className="badge bg-danger badge-custom">Cận date &lt; 180 ngày</span>
          </div>
          <div className="card-body p-0">
            {items.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p className="mb-0">Không tìm thấy lô thuốc nào phù hợp.</p>
              </div>
            ) : (
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Mã Thuốc</th>
                    <th>Tên Thuốc (Nhóm)</th>
                    <th>Mã Lô</th>
                    <th>Nhà Cung Cấp</th>
                    <th>Tồn Kho</th>
                    <th>Hạn Sử Dụng</th>
                    <th>Tình Trạng</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(i => (
                    <tr key={i.maLo} className={i.ngayConLai < 180 ? "table-danger" : ""}>
                      <td className="text-center"><span className="badge bg-secondary badge-custom">{i.maThuoc}</span></td>
                      <td><strong>{i.tenThuoc}</strong><br/><small className="text-muted">{i.tenNhom}</small></td>
                      <td className="text-center"><span className="badge border text-dark bg-light">{i.maLo}</span></td>
                      <td>{i.tenNcc}</td>
                      <td className="text-center fw-bold text-success">{i.soLuong}</td>
                      <td className="text-center">{new Date(i.hanSuDung).toLocaleDateString('vi-VN')}</td>
                      <td className="text-center">
                        {i.ngayConLai < 0 ? <span className="badge bg-dark badge-custom">Hết hạn</span> :
                         i.ngayConLai < 180 ? <span className="badge bg-danger badge-custom">Cận date ({i.ngayConLai} ngày)</span> :
                         <span className="badge bg-success badge-custom">An toàn ({i.ngayConLai} ngày)</span>}
                      </td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-danger-custom" onClick={() => handleExport(i.maLo)}>
                          🗑️ Xuất Kho
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;