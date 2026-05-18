import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
      fetchUsers(); // refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi thao tác');
    }
  };

  if (loading) return <div className="text-center mt-5">Đang tải...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Quản lý tài khoản</h4>
          <button className="btn btn-outline-light" onClick={() => navigate('/')}>
            Quay lại Dashboard
          </button>
        </div>
        <div className="card-body">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
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
                  <td>{u.username}</td>
                  <td>
                    {u.isActive ? (
                      <span className="badge bg-success">Hoạt động</span>
                    ) : (
                      <span className="badge bg-danger">Vô hiệu hóa</span>
                    )}
                  </td>
                  <td>{u.isAdmin ? <span className="badge bg-warning">Admin</span> : 'Người dùng'}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u.username !== user.username && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => toggleUser(u.username)}
                      >
                        {u.isActive ? 'Vô hiệu hóa' : 'Mở khóa'}
                      </button>
                    )}
                    {u.username === user.username && (
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