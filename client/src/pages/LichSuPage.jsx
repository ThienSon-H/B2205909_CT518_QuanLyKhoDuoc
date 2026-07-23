import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const LICH_SU_URL = 'http://localhost:7122/api/Thuoc/lich-su';

function LichSuPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get(LICH_SU_URL, {
      params: { username: user?.username }
    })
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [user]);

  const filteredData = data.filter(item => {
    if (!search.trim()) return true;
    const keyword = search.toLowerCase();
    return (
      (item.maLo && item.maLo.toLowerCase().includes(keyword)) ||
      (item.maThuoc && item.maThuoc.toLowerCase().includes(keyword)) ||
      (item.loaiGiaoDich && item.loaiGiaoDich.toLowerCase().includes(keyword)) ||
      (item.nguoiThucHien && item.nguoiThucHien.toLowerCase().includes(keyword)) ||
      (item.ghiChu && item.ghiChu.toLowerCase().includes(keyword))
    );
  });

  if (loading) return (
    <div className="loading-section">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-3">Đang tải lịch sử giao dịch...</p>
    </div>
  );

  return (
    <div className="page-wrapper fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2 className="fw-bold mb-1">📜 Lịch sử Nhập / Xuất Kho</h2>
          <p className="dashboard-subtitle">Danh sách giao dịch gần đây nhất</p>
        </div>
        <Link to="/" className="btn btn-outline-primary-custom ripple">
          ← Quay lại Dashboard
        </Link>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="card-custom mb-4 filter-card">
        <div className="card-body">
          <div className="input-with-icon">
            <span className="input-icon">🔍</span>
            <input
              type="text"
              className="form-control-custom"
              placeholder="Tìm theo mã lô, mã thuốc, loại giao dịch, người thực hiện hoặc ghi chú..."
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
      </div>

      <div className="card-custom">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Lịch sử giao dịch</span>
          <span className="badge bg-info badge-custom">{filteredData.length} giao dịch</span>
        </div>
        <div className="card-body p-0">
          {filteredData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p className="empty-text">Không tìm thấy giao dịch nào phù hợp.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Loại</th>
                    <th>Mã Lô</th>
                    <th>Mã Thuốc</th>
                    <th>SL Thay Đổi</th>
                    <th>Người thực hiện</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.thoiGian).toLocaleString('vi-VN')}</td>
                      <td>
                        {item.loaiGiaoDich === 'NHAP' ? (
                          <span className="badge bg-success badge-custom">NHẬP</span>
                        ) : (
                          <span className="badge bg-danger badge-custom">XUẤT</span>
                        )}
                      </td>
                      <td className="text-center">{item.maLo}</td>
                      <td className="text-center">{item.maThuoc}</td>
                      <td className="text-center fw-bold">{item.soLuongThayDoi}</td>
                      <td>{item.nguoiThucHien || '—'}</td>
                      <td><small>{item.ghiChu}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LichSuPage;