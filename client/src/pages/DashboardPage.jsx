import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DASHBOARD_URL = 'https://localhost:7122/api/Thuoc/dashboard';
const EXPORT_URL = 'https://localhost:7122/api/Thuoc/xuat-lo';

function DashboardPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    setLoading(true);
    axios.get(DASHBOARD_URL)
      .then(res => { setItems(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchDashboard(); }, []);

  const handleExport = async (maLo) => {
    if (!window.confirm(`⚠️ Xuất (xóa) lô ${maLo}? Không thể hoàn tác.`)) return;
    try {
      const res = await axios.delete(`${EXPORT_URL}/${maLo}`);
      if (res.data.message.includes('LỖI')) alert(res.data.message);
      else { alert(res.data.message); fetchDashboard(); }
    } catch (err) { alert("Lỗi kết nối server khi xuất kho!"); }
  };

  if (loading) return (
    <div className="text-center mt-5 pt-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-3">Đang tải dữ liệu tồn kho...</p>
    </div>
  );

  return (
    <div className="container-fluid py-4 px-3 px-md-4 fade-in">
      <div className="dashboard-header">
        <h2 className="text-primary fw-bold mb-0">📊 Bảng Tồn Kho Dược Phẩm</h2>
        <Link to="/nhap-lo" className="btn btn-success-custom">
          ➕ Nhập Lô Mới
        </Link>
      </div>

      <div className="card-custom">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Danh sách lô thuốc (FEFO)</span>
          <span className="badge bg-danger badge-custom">Cận date &lt; 180 ngày</span>
        </div>
        <div className="card-body p-0">
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
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;