import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'https://localhost:7122/api/DanhMuc';

function DanhMucPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('nhom');
  const [nhomThuoc, setNhomThuoc] = useState([]);
  const [nhaCungCap, setNhaCungCap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = thêm mới
  const [formData, setFormData] = useState({ ma: '', ten: '', soDienThoai: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab, user]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'nhom') {
        const res = await axios.get(`${API_BASE}/nhom-thuoc`, {
          params: { adminUsername: user?.username }
        });
        setNhomThuoc(res.data);
      } else {
        const res = await axios.get(`${API_BASE}/nha-cung-cap`, {
          params: { adminUsername: user?.username }
        });
        setNhaCungCap(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ ma: '', ten: '', soDienThoai: '' });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (activeTab === 'nhom') {
      setFormData({ ma: item.maNhom, ten: item.tenNhom, soDienThoai: '' });
    } else {
      setFormData({ ma: item.maNcc, ten: item.tenNcc, soDienThoai: item.soDienThoai || '' });
    }
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const adminUsername = user?.username;
    try {
      let res;
      if (activeTab === 'nhom') {
        if (editingItem) {
          res = await axios.put(`${API_BASE}/nhom-thuoc/${formData.ma}`, { tenNhom: formData.ten }, { params: { adminUsername } });
        } else {
          res = await axios.post(`${API_BASE}/nhom-thuoc`, { maNhom: formData.ma, tenNhom: formData.ten }, { params: { adminUsername } });
        }
      } else {
        if (editingItem) {
          res = await axios.put(`${API_BASE}/nha-cung-cap/${formData.ma}`, { tenNcc: formData.ten, soDienThoai: formData.soDienThoai }, { params: { adminUsername } });
        } else {
          res = await axios.post(`${API_BASE}/nha-cung-cap`, { maNcc: formData.ma, tenNcc: formData.ten, soDienThoai: formData.soDienThoai }, { params: { adminUsername } });
        }
      }
      if (res.data.message?.startsWith('LỖI')) {
        alert(res.data.message);
      } else {
        alert(res.data.message);
        setShowForm(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi kết nối server');
    }
  };

  const handleDelete = async (ma) => {
    if (!window.confirm(`Xóa ${activeTab === 'nhom' ? 'nhóm' : 'NCC'} "${ma}"?`)) return;
    try {
      const res = activeTab === 'nhom'
        ? await axios.delete(`${API_BASE}/nhom-thuoc/${ma}`, { params: { adminUsername: user?.username } })
        : await axios.delete(`${API_BASE}/nha-cung-cap/${ma}`, { params: { adminUsername: user?.username } });
      if (res.data.message?.startsWith('LỖI')) {
        alert(res.data.message);
      } else {
        alert(res.data.message);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi kết nối server');
    }
  };

  return (
    <div className="page-wrapper fade-in">
      <div className="dashboard-header">
        <div>
          <h2 className="fw-bold mb-1">📋 Quản lý Danh mục</h2>
          <p className="dashboard-subtitle">Nhóm thuốc và Nhà cung cấp</p>
        </div>
        <Link to="/" className="btn btn-outline-primary-custom ripple">
          ← Quay lại Dashboard
        </Link>
      </div>

      {/* Tabs Material Design */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'nhom' ? 'active' : ''}`}
            onClick={() => { setActiveTab('nhom'); setShowForm(false); }}
          >
            <span className="tab-icon">💊</span> Nhóm Thuốc
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'ncc' ? 'active' : ''}`}
            onClick={() => { setActiveTab('ncc'); setShowForm(false); }}
          >
            <span className="tab-icon">🚚</span> Nhà Cung Cấp
          </button>
        </li>
      </ul>

      {/* Nút thêm mới */}
      <button className="btn btn-success-custom mb-3 ripple" onClick={handleAdd}>
        ➕ Thêm {activeTab === 'nhom' ? 'Nhóm Thuốc' : 'Nhà Cung Cấp'}
      </button>

      {/* Form thêm/sửa */}
      {showForm && (
        <div className="card-custom mb-4">
          <div className="card-header">
            <span>{editingItem ? 'Chỉnh sửa' : 'Thêm mới'} {activeTab === 'nhom' ? 'Nhóm Thuốc' : 'Nhà Cung Cấp'}</span>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Mã {activeTab === 'nhom' ? 'nhóm' : 'NCC'}
                </label>
                <input
                  type="text"
                  className="form-control-custom"
                  value={formData.ma}
                  onChange={e => setFormData({ ...formData, ma: e.target.value.toUpperCase() })}
                  required
                  disabled={!!editingItem}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Tên {activeTab === 'nhom' ? 'nhóm' : 'NCC'}
                </label>
                <input
                  type="text"
                  className="form-control-custom"
                  value={formData.ten}
                  onChange={e => setFormData({ ...formData, ten: e.target.value })}
                  required
                />
              </div>
              {activeTab === 'ncc' && (
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Số điện thoại</label>
                  <input
                    type="text"
                    className="form-control-custom"
                    value={formData.soDienThoai}
                    onChange={e => setFormData({ ...formData, soDienThoai: e.target.value })}
                  />
                </div>
              )}
              <div className="col-12 d-flex justify-content-end gap-2 mt-3">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary-custom ripple">
                  {editingItem ? 'Cập nhật' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error */}
      {error && <div className="alert alert-danger alert-custom">{error}</div>}

      {/* Bảng danh sách */}
      <div className="card-custom">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>{activeTab === 'nhom' ? 'Nhóm Thuốc' : 'Nhà Cung Cấp'}</span>
          <span className="badge bg-info badge-custom">
            {activeTab === 'nhom' ? nhomThuoc.length : nhaCungCap.length} mục
          </span>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="loading-section">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2">Đang tải...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Tên</th>
                    {activeTab === 'ncc' && <th>Số điện thoại</th>}
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'nhom' && nhomThuoc.map(item => (
                    <tr key={item.maNhom}>
                      <td><span className="badge bg-secondary badge-custom">{item.maNhom}</span></td>
                      <td><strong>{item.tenNhom}</strong></td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(item)}>
                            ✏️ Sửa
                          </button>
                          <button className="btn btn-sm btn-danger-custom" onClick={() => handleDelete(item.maNhom)}>
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'ncc' && nhaCungCap.map(item => (
                    <tr key={item.maNcc}>
                      <td><span className="badge bg-secondary badge-custom">{item.maNcc}</span></td>
                      <td><strong>{item.tenNcc}</strong></td>
                      <td>{item.soDienThoai || '—'}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(item)}>
                            ✏️ Sửa
                          </button>
                          <button className="btn btn-sm btn-danger-custom" onClick={() => handleDelete(item.maNcc)}>
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {((activeTab === 'nhom' && nhomThuoc.length === 0) ||
                    (activeTab === 'ncc' && nhaCungCap.length === 0)) && (
                    <tr>
                      <td colSpan={activeTab === 'ncc' ? 4 : 3} className="text-center text-muted py-3">
                        Chưa có dữ liệu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DanhMucPage;