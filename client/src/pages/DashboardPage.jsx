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
    <div className="container mt-5 text-center">
      <div className="spinner-border text-primary"></div> Đang tải dữ liệu...
    </div>
  );

  return (
    <div className="container-fluid py-4 px-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">🏥 Bảng Tồn Kho Dược Phẩm</h2>
        <Link to="/nhap-lo" className="btn btn-success btn-lg">
          + Nhập Lô Mới
        </Link>
      </div>

      <div className="card shadow border-0">
        <div className="card-header bg-dark text-white d-flex justify-content-between">
          <span>Danh sách lô thuốc (FEFO)</span>
          <span className="badge bg-danger">Ưu tiên hiển thị thuốc Cận Date</span>
        </div>
        <div className="card-body p-0">
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="table-light">
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
                    <button className="btn btn-outline-danger btn-sm w-100" onClick={() => handleExport(i.maLo)}>Xuất Kho</button>
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