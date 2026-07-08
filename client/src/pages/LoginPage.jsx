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
    <div className="auth-container fade-in">
      <div className="auth-card">
        <div className="card-header">
          <div className="auth-icon">🔐</div>
          <h1 className="auth-title">Đăng nhập hệ thống</h1>
          <p className="auth-subtitle">Quản lý kho dược thông minh</p>
        </div>

        <div className="auth-body">
          {error && (
            <div className="alert alert-danger alert-custom">
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group-custom">
              <label className="form-label" htmlFor="username">
                <span className="label-icon">👤</span> Tên đăng nhập
              </label>
              <div className="input-with-icon">
                <span className="input-icon">@</span>
                <input
                  id="username"
                  type="text"
                  className="form-control-custom"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group-custom">
              <label className="form-label" htmlFor="password">
                <span className="label-icon">🔒</span> Mật khẩu
              </label>
              <div className="input-with-icon">
                <span className="input-icon">🔑</span>
                <input
                  id="password"
                  type="password"
                  className="form-control-custom"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary-custom w-100 mt-4 ripple"
            >
              <span className="btn-text">Đăng nhập</span>
              <span className="btn-arrow">→</span>
            </button>
          </form>

          <div className="auth-footer">
            <span className="text-muted">Chưa có tài khoản? </span>
            <Link to="/register" className="auth-link">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;