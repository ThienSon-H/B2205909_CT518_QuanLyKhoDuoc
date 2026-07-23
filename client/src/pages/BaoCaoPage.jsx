import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BAO_CAO_URL = 'http://localhost:7122/api/Thuoc/bao-cao-ton-kho';

function BaoCaoPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get(BAO_CAO_URL, {
      params: { username: user?.username }
    })
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [user]);

  const filteredData = data.filter(item => {
    if (!search.trim()) return true;
    const keyword = search.toLowerCase();
    return (
      (item.maThuoc && item.maThuoc.toLowerCase().includes(keyword)) ||
      (item.tenThuoc && item.tenThuoc.toLowerCase().includes(keyword)) ||
      (item.tenNhom && item.tenNhom.toLowerCase().includes(keyword))
    );
  });

  if (loading) return (
    <div className="loading-section">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-3">Đang tải báo cáo tồn kho...</p>
    </div>
  );

  return (
    <div className="page-wrapper fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2 className="fw-bold mb-1">📋 Báo cáo tổng tồn kho theo thuốc</h2>
          <p className="dashboard-subtitle">Tổng hợp số lượng, số lô và hạn dùng sớm nhất</p>
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
              placeholder="Tìm theo mã thuốc, tên thuốc hoặc nhóm..."
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
          <span>Tổng hợp tồn kho</span>
          <span className="badge bg-info badge-custom">{filteredData.length} thuốc</span>
        </div>
        <div className="card-body p-0">
          {filteredData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p className="empty-text">Không tìm thấy dữ liệu phù hợp.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Mã Thuốc</th>
                    <th>Tên Thuốc</th>
                    <th>Nhóm</th>
                    <th className="text-center">Tổng SL Tồn</th>
                    <th className="text-center">Số Lô</th>
                    <th className="text-center">Hạn Sớm Nhất</th>
                    <th className="text-center">Tình Trạng</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, idx) => (
                    <tr key={idx} className={item.ngayConLai != null && item.ngayConLai < 180 ? "table-danger" : ""}>
                      <td>
                        <span className="badge bg-secondary badge-custom">{item.maThuoc}</span>
                      </td>
                      <td><strong>{item.tenThuoc}</strong></td>
                      <td><small className="text-muted">{item.tenNhom}</small></td>
                      <td className="text-center fw-bold text-success">{item.tongSoLuong}</td>
                      <td className="text-center">{item.soLo}</td>
                      <td className="text-center">
                        {item.hanSomNhat ? new Date(item.hanSomNhat).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="text-center">
                        {item.ngayConLai == null ? (
                          <span className="badge bg-secondary badge-custom">Chưa có lô</span>
                        ) : item.ngayConLai < 0 ? (
                          <span className="badge bg-dark badge-custom">Có lô hết hạn</span>
                        ) : item.ngayConLai < 180 ? (
                          <span className="badge bg-danger badge-custom">Cận date ({item.ngayConLai} ngày)</span>
                        ) : (
                          <span className="badge bg-success badge-custom">An toàn ({item.ngayConLai} ngày)</span>
                        )}
                      </td>
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

export default BaoCaoPage;