import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BAO_CAO_URL = 'https://localhost:7122/api/Thuoc/bao-cao-ton-kho';

function BaoCaoPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(BAO_CAO_URL)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="text-center mt-5 pt-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-3">Đang tải báo cáo tồn kho...</p>
    </div>
  );

  return (
    <div className="container-fluid py-4 px-3 px-md-4 fade-in">
      <div className="dashboard-header">
        <h2 className="text-primary fw-bold mb-0">📋 Báo cáo tổng tồn kho theo thuốc</h2>
        <Link to="/" className="btn btn-outline-primary-custom">
          ← Quay lại Dashboard
        </Link>
      </div>

      <div className="card-custom">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Tổng hợp số lượng tồn, số lô và hạn sớm nhất</span>
          <span className="badge bg-info badge-custom">{data.length} thuốc</span>
        </div>
        <div className="card-body p-0">
          {data.length === 0 ? (
            <div className="text-center py-5 text-muted">Chưa có dữ liệu.</div>
          ) : (
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Mã Thuốc</th>
                  <th>Tên Thuốc</th>
                  <th>Nhóm</th>
                  <th>Tổng SL Tồn</th>
                  <th>Số Lô</th>
                  <th>Hạn Sớm Nhất</th>
                  <th>Tình Trạng</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={idx} className={item.ngayConLai != null && item.ngayConLai < 180 ? "table-danger" : ""}>
                    <td className="text-center">
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
          )}
        </div>
      </div>
    </div>
  );
}

export default BaoCaoPage;