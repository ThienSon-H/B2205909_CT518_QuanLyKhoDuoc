import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function AccountManagementPage() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      const res = await axios.get('https://localhost:7122/api/Auth/users', {
        params: { adminUsername: user.username }
      });
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = async (targetUsername) => {
    try {
      const res = await axios.post(
        'https://localhost:7122/api/Auth/toggle-user',
        { targetUsername },
        { params: { adminUsername: user.username } }
      );
      alert(res.data.message);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi thao tác');
    }
  };

  if (loading) return (
    <div className="text-center mt-5 pt-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-3">Đang tải danh sách người dùng...</p>
    </div>
  );

  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  return (
    <div className="container py-4 fade-in">
      <div className="card-custom">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">👥 Quản lý tài khoản</h4>
          <Link to="/" className="btn btn-outline-light btn-sm">
            ← Quay lại Dashboard
          </Link>
        </div>
        <div className="card-body p-0">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Tên đăng nhập</th>
                <th>Trạng thái</th>
                <th>Quyền Admin</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.username}>
                  <td><span className="fw-semibold">{u.username}</span></td>
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
                  <td>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    {u.username !== user.username ? (
                      <button
                        className="btn btn-sm btn-danger-custom"
                        onClick={() => toggleUser(u.username)}
                      >
                        {u.isActive ? '🔒 Vô hiệu hóa' : '🔓 Mở khóa'}
                      </button>
                    ) : (
                      <span className="text-muted">(Chính bạn)</span>
                    )}
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

export default AccountManagementPage;