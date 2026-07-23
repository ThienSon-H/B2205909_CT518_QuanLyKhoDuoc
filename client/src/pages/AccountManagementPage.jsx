import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function AccountManagementPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [inventoryPermissions, setInventoryPermissions] = useState({});
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:7122/api/Auth/users', {
        params: { adminUsername: user.username }
      });
      const fetchedUsers = res.data;
      setUsers(fetchedUsers);
      const perms = {};
      fetchedUsers.forEach(u => {
        perms[u.username] = u.isAdmin || u.canManageInventory;
      });
      setInventoryPermissions(perms);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = async (targetUsername) => {
    try {
      const res = await axios.post(
        'http://localhost:7122/api/Auth/toggle-user',
        { targetUsername },
        { params: { adminUsername: user.username } }
      );
      addToast(res.data.message, res.data.message.startsWith('LỖI') ? 'error' : 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi thao tác', 'error');
    }
  };

  const handleInventoryChange = (username, checked) => {
    setInventoryPermissions(prev => ({ ...prev, [username]: checked }));
  };

  const saveInventoryPermissions = async () => {
    setSaving(true);
    try {
      const changes = users.filter(u => {
        if (u.isAdmin) return false;
        const current = inventoryPermissions[u.username];
        return current !== (u.canManageInventory || u.isAdmin);
      });

      if (changes.length === 0) {
        addToast('Không có thay đổi nào để lưu.', 'info');
        setSaving(false);
        return;
      }

      for (const u of changes) {
        await axios.post(
          'http://localhost:7122/api/Auth/toggle-inventory-permission',
          { targetUsername: u.username },
          { params: { adminUsername: user.username } }
        );
      }

      addToast('Lưu quyền QLK thành công!', 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi khi lưu quyền', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (!search.trim()) return true;
    const keyword = search.toLowerCase();
    return u.username && u.username.toLowerCase().includes(keyword);
  });

  if (loading) return (
    <div className="loading-section">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-3">Đang tải danh sách người dùng...</p>
    </div>
  );

  if (error) return (
    <div className="page-wrapper fade-in">
      <div className="alert alert-danger alert-custom m-4">{error}</div>
    </div>
  );

  return (
    <div className="page-wrapper fade-in">
      <div className="dashboard-header">
        <div>
          <h2 className="fw-bold mb-1">👥 Quản lý tài khoản</h2>
          <p className="dashboard-subtitle">Kiểm soát người dùng và phân quyền</p>
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
              placeholder="Tìm theo tên đăng nhập..."
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
          <span>Danh sách người dùng</span>
          <span className="badge bg-info badge-custom">{filteredUsers.length} tài khoản</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Tên đăng nhập</th>
                  <th>Trạng thái</th>
                  <th>Quyền Admin</th>
                  <th>Quyền QLK</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.username}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="user-avatar-circle">👤</span>
                        <span className="fw-semibold">{u.username}</span>
                      </div>
                    </td>
                    <td>
                      {u.isActive ? (
                        <span className="badge bg-success badge-custom">Hoạt động</span>
                      ) : (
                        <span className="badge bg-danger badge-custom">Vô hiệu hóa</span>
                      )}
                    </td>
                    <td>
                      {u.isAdmin ? (
                        <span className="badge bg-warning text-dark badge-custom">Admin</span>
                      ) : (
                        <span className="text-muted">Người dùng</span>
                      )}
                    </td>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={inventoryPermissions[u.username] || false}
                        disabled={u.isAdmin}
                        onChange={(e) => handleInventoryChange(u.username, e.target.checked)}
                      />
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      {u.username !== user.username ? (
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-danger-custom"
                            onClick={() => toggleUser(u.username)}
                          >
                            {u.isActive ? '🔒 Vô hiệu hóa' : '🔓 Mở khóa'}
                          </button>
                        </div>
                      ) : (
                        <span className="badge bg-light text-dark border">Chính bạn</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p className="empty-text">Không tìm thấy tài khoản nào phù hợp.</p>
            </div>
          )}

          <div className="p-3 d-flex justify-content-end">
            <button
              className="btn btn-primary-custom ripple"
              onClick={saveInventoryPermissions}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Đang lưu...
                </>
              ) : (
                '💾 Lưu quyền QLK'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountManagementPage;