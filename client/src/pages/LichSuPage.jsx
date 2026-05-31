import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const LICH_SU_URL = 'https://localhost:7122/api/Thuoc/lich-su';

function LichSuPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(LICH_SU_URL)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="text-center mt-5 pt-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-3">Đang tải lịch sử giao dịch...</p>
    </div>
  );

  return (
    <div className="container-fluid py-4 px-3 px-md-4 fade-in">
      <div className="dashboard-header">
        <h2 className="text-primary fw-bold mb-0">📜 Lịch sử Nhập / Xuất Kho</h2>
        <Link to="/" className="btn btn-outline-primary-custom">
          ← Quay lại Dashboard
        </Link>
      </div>

      <div className="card-custom">
        <div className="card-header d-flex justify-content-between">
          <span>Danh sách giao dịch gần đây</span>
          <span className="badge bg-light text-dark">{data.length} giao dịch</span>
        </div>
        <div className="card-body p-0">
          {data.length === 0 ? (
            <div className="text-center py-5 text-muted">Chưa có giao dịch nào.</div>
          ) : (
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
                {data.map((item) => (
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
          )}
        </div>
      </div>
    </div>
  );
}

export default LichSuPage;