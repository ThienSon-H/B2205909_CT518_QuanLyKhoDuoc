import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const DASHBOARD_URL = 'http://localhost:7122/api/Thuoc/dashboard';
const EXPORT_URL = 'http://localhost:7122/api/Thuoc/xuat-lo';

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
          username: user?.username
        }
      });
      setItems(res.data);
    } catch (err) {
      console.error(err);
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

  const handleExport = async (maLo, soLuongTon) => {
    const soLuongNhap = prompt(`Nhập số lượng cần xuất từ lô ${maLo} (tối đa ${soLuongTon}):`, soLuongTon);
    if (!soLuongNhap) return;
    const soLuong = parseInt(soLuongNhap);
    if (isNaN(soLuong) || soLuong <= 0 || soLuong > soLuongTon) {
        alert(`Vui lòng nhập số từ 1 đến ${soLuongTon}`);
        return;
    }
    if (!window.confirm(`⚠️ Xuất ${soLuong} đơn vị từ lô ${maLo}?`)) return;
    try {
        const res = await axios.delete(`${EXPORT_URL}/${maLo}`, {
            params: { soLuongXuat: soLuong, nguoiThucHien: user?.username }
        });
        if (res.data.message.includes('LỖI')) alert(res.data.message);
        else { alert(res.data.message); fetchDashboard(); }
    } catch (err) {
        alert("Lỗi kết nối server khi xuất kho!");
    }
};

  return (
    <div className="page-wrapper fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2 className="fw-bold mb-1">📊 Bảng Tồn Kho Dược Phẩm</h2>
          <p className="dashboard-subtitle">Quản lý lô thuốc theo nguyên tắc FEFO</p>
        </div>
        <Link to="/nhap-lo" className="btn btn-success-custom ripple">
          <span className="btn-icon">➕</span> Nhập Lô Mới
        </Link>
      </div>

      {/* Bộ lọc */}
      <div className="card-custom mb-4 filter-card">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-with-icon">
                <span className="input-icon">🔍</span>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="Tìm theo mã thuốc, tên thuốc hoặc mã lô..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Tìm kiếm"
                />
                {search && (
                  <button
                    className="btn btn-outline-secondary input-clear-btn"
                    onClick={() => setSearch('')}
                    aria-label="Xóa tìm kiếm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select-custom"
                value={trangThai}
                onChange={(e) => setTrangThai(e.target.value)}
                aria-label="Lọc trạng thái"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="con_han">✅ Còn hạn (&gt; 180 ngày)</option>
                <option value="can_date">⚠️ Cận date (&lt; 180 ngày)</option>
                <option value="het_han">❌ Hết hạn</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-primary-custom w-100 ripple"
                onClick={fetchDashboard}
              >
                🔄 Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="loading-section">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Đang tải dữ liệu tồn kho...</p>
        </div>
      ) : (
        <div className="card-custom">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Danh sách lô thuốc (FEFO) {items.length > 0 && `- ${items.length} lô`}</span>
            <span className="badge bg-danger badge-custom">⚠️ Cận date &lt; 180 ngày</span>
          </div>
          <div className="card-body p-0">
            {items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <p className="empty-text">Không tìm thấy lô thuốc nào phù hợp.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table-custom">
                  <thead>
                    <tr>
                      <th>Mã Thuốc</th>
                      <th>Tên Thuốc (Nhóm)</th>
                      <th>Mã Lô</th>
                      <th>Nhà Cung Cấp</th>
                      <th className="text-center">Tồn Kho</th>
                      <th className="text-center">Hạn Sử Dụng</th>
                      <th className="text-center">Tình Trạng</th>
                      <th className="text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(i => (
                      <tr key={i.maLo} className={i.ngayConLai < 180 ? "table-danger" : ""}>
                        <td>
                          <span className="badge bg-secondary badge-custom">{i.maThuoc}</span>
                        </td>
                        <td>
                          <strong>{i.tenThuoc}</strong>
                          <br />
                          <small className="text-muted">{i.tenNhom}</small>
                        </td>
                        <td className="text-center">
                          <span className="badge border text-dark bg-light">{i.maLo}</span>
                        </td>
                        <td>{i.tenNcc}</td>
                        <td className="text-center fw-bold text-success">{i.soLuong}</td>
                        <td className="text-center">{new Date(i.hanSuDung).toLocaleDateString('vi-VN')}</td>
                        <td className="text-center">
                          {i.ngayConLai < 0 ? (
                            <span className="badge bg-dark badge-custom">Hết hạn</span>
                          ) : i.ngayConLai < 180 ? (
                            <span className="badge bg-danger badge-custom">Cận date ({i.ngayConLai} ngày)</span>
                          ) : (
                            <span className="badge bg-success badge-custom">An toàn ({i.ngayConLai} ngày)</span>
                          )}
                        </td>
                        <td className="text-center">
                          <button
                              className="btn btn-sm btn-danger-custom ripple"
                              onClick={() => handleExport(i.maLo, i.soLuong)}
                              title="Xuất kho lô này"
                          >
                              🗑️ Xuất Kho
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;