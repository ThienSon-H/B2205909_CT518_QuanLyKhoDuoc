import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';

const API_BASE = 'http://localhost:7122/api/Thuoc';
const NHOM_URL = 'http://localhost:7122/api/DanhMuc/nhom-thuoc-public';

function QuanLyThuocPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [thuocList, setThuocList] = useState([]);
  const [nhomList, setNhomList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    maThuoc: '',
    tenThuoc: '',
    maNhom: '',
    donViTinh: ''
  });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
    fetchNhom();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/admin`, {
        params: { adminUsername: user?.username }
      });
      setThuocList(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải danh sách thuốc');
    } finally {
      setLoading(false);
    }
  };

  const fetchNhom = async () => {
    try {
      const res = await axios.get(NHOM_URL, { params: { username: user?.username } });
      setNhomList(res.data);
    } catch (err) {
      console.error('Lỗi tải nhóm thuốc:', err);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ maThuoc: '', tenThuoc: '', maNhom: '', donViTinh: '' });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    const nhom = nhomList.find(n => n.tenNhom === item.tenNhom);
    setFormData({
      maThuoc: item.maThuoc,
      tenThuoc: item.tenThuoc,
      maNhom: nhom ? nhom.maNhom : '',
      donViTinh: item.donViTinh
    });
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
      if (editingItem) {
        res = await axios.put(`${API_BASE}/${editingItem.maThuoc}`, formData, {
          params: { adminUsername }
        });
      } else {
        res = await axios.post(API_BASE, formData, {
          params: { adminUsername }
        });
      }
      addToast(res.data.message, res.data.message.startsWith('LỖI') ? 'error' : 'success');
      setShowForm(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi kết nối server', 'error');
    }
  };

  const handleDelete = (maThuoc) => {
    setConfirmModal({
      show: true,
      message: `Bạn có chắc chắn muốn xóa thuốc "${maThuoc}"?`,
      onConfirm: async () => {
        try {
          const res = await axios.delete(`${API_BASE}/${maThuoc}`, {
            params: { adminUsername: user?.username }
          });
          addToast(res.data.message, res.data.message.startsWith('LỖI') ? 'error' : 'success');
          fetchData();
        } catch (err) {
          addToast(err.response?.data?.message || 'Lỗi kết nối server', 'error');
        }
        setConfirmModal({ show: false, message: '', onConfirm: null });
      }
    });
  };

  const filteredList = thuocList.filter(item => {
    if (!search.trim()) return true;
    const keyword = search.toLowerCase();
    return (
      (item.maThuoc && item.maThuoc.toLowerCase().includes(keyword)) ||
      (item.tenThuoc && item.tenThuoc.toLowerCase().includes(keyword)) ||
      (item.tenNhom && item.tenNhom.toLowerCase().includes(keyword))
    );
  });

  return (
    <div className="page-wrapper fade-in">
      <div className="dashboard-header">
        <div>
          <h2 className="fw-bold mb-1">💊 Quản lý Thuốc</h2>
          <p className="dashboard-subtitle">Thêm, sửa, xóa danh mục thuốc</p>
        </div>
        <Link to="/" className="btn btn-outline-primary-custom ripple">
          ← Quay lại Dashboard
        </Link>
      </div>

      <button className="btn btn-success-custom mb-3 ripple" onClick={handleAdd}>
        ➕ Thêm Thuốc Mới
      </button>

      {showForm && (
        <div className="card-custom mb-4">
          <div className="card-header">
            <span>{editingItem ? 'Chỉnh sửa Thuốc' : 'Thêm Thuốc Mới'}</span>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Mã Thuốc</label>
                <input
                  type="text"
                  className="form-control-custom"
                  value={formData.maThuoc}
                  onChange={e => setFormData({ ...formData, maThuoc: e.target.value.toUpperCase() })}
                  required
                  disabled={!!editingItem}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Tên Thuốc</label>
                <input
                  type="text"
                  className="form-control-custom"
                  value={formData.tenThuoc}
                  onChange={e => setFormData({ ...formData, tenThuoc: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Nhóm Thuốc</label>
                <select
                  className="form-select-custom"
                  value={formData.maNhom}
                  onChange={e => setFormData({ ...formData, maNhom: e.target.value })}
                >
                  <option value="">Chọn nhóm...</option>
                  {nhomList.map(nhom => (
                    <option key={nhom.maNhom} value={nhom.maNhom}>
                      {nhom.tenNhom} ({nhom.maNhom})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold">Đơn Vị Tính</label>
                <input
                  type="text"
                  className="form-control-custom"
                  value={formData.donViTinh}
                  onChange={e => setFormData({ ...formData, donViTinh: e.target.value })}
                  placeholder="VD: Viên, Gói..."
                />
              </div>
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

      {error && <div className="alert alert-danger alert-custom">{error}</div>}

      <div className="card-custom">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Danh sách Thuốc</span>
          <span className="badge bg-info badge-custom">{filteredList.length} thuốc</span>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="loading-section">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2">Đang tải...</p>
            </div>
          ) : (
            <div className="table-responsive">
              {filteredList.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <p className="empty-text">
                    {search.trim() ? 'Không tìm thấy thuốc nào phù hợp.' : 'Chưa có thuốc nào.'}
                  </p>
                </div>
              ) : (
                <table className="table-custom">
                  <thead>
                    <tr>
                      <th>Mã Thuốc</th>
                      <th>Tên Thuốc</th>
                      <th>Nhóm</th>
                      <th>Đơn Vị Tính</th>
                      <th className="text-center">Tổng Tồn</th>
                      <th className="text-center">Số Lô</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map(item => (
                      <tr key={item.maThuoc}>
                        <td><span className="badge bg-secondary badge-custom">{item.maThuoc}</span></td>
                        <td><strong>{item.tenThuoc}</strong></td>
                        <td>{item.tenNhom}</td>
                        <td>{item.donViTinh || '—'}</td>
                        <td className="text-center fw-bold text-success">{item.tongTon}</td>
                        <td className="text-center">{item.soLo}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(item)}>
                              ✏️ Sửa
                            </button>
                            <button
                              className={`btn btn-sm ${item.tongTon > 0 ? 'btn-secondary' : 'btn-danger-custom'}`}
                              onClick={() => handleDelete(item.maThuoc)}
                              disabled={item.tongTon > 0}
                              title={item.tongTon > 0 ? 'Không thể xóa khi còn tồn kho' : 'Xóa thuốc'}
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        show={confirmModal.show}
        title="Xác nhận xóa"
        message={confirmModal.message}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
      />
    </div>
  );
}

export default QuanLyThuocPage;