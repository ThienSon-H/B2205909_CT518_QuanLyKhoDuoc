import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('https://localhost:7122/api/Auth/login', {
        username,
        password
      });
      if (res.data.success) {
        login({
          username: res.data.username,
          isAdmin: res.data.isAdmin,
          isActive: res.data.isActive
        });
        navigate('/');
      } else {
        setError('Đăng nhập thất bại, vui lòng kiểm tra lại');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi kết nối server');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <div className="card shadow">
        <div className="card-header bg-primary text-white text-center">
          <h3>Đăng nhập hệ thống</h3>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label>Mật khẩu</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Đăng nhập
            </button>
          </form>
          <div className="text-center mt-3">
            <Link to="/register">Chưa có tài khoản? Đăng ký</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;