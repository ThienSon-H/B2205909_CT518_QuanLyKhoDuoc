import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateInput = () => {
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (username.length < 5) {
      setError('Tên đăng nhập phải có ít nhất 5 ký tự');
      return false;
    }
    if (!usernameRegex.test(username)) {
      setError('Tên đăng nhập chỉ được chứa chữ cái và số');
      return false;
    }
    const passwordRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }
    if (!passwordRegex.test(password)) {
      setError('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*)');
      return false;
    }
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!validateInput()) return;
    try {
      const res = await axios.post('https://localhost:7122/api/Auth/register', {
        username,
        password
      });
      if (!res.data.message.startsWith('LỖI')) {
        setMessage('Đăng ký thành công! Vui lòng đăng nhập.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card">
        <div className="card-header">
          <div className="auth-icon">📝</div>
          <h1 className="auth-title">Đăng ký tài khoản</h1>
          <p className="auth-subtitle">Tạo tài khoản mới để bắt đầu</p>
        </div>

        <div className="auth-body">
          {message && (
            <div className="alert alert-success alert-custom">
              <span className="alert-icon">✅</span>
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="alert alert-danger alert-custom">
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group-custom">
              <label className="form-label" htmlFor="reg-username">
                <span className="label-icon">👤</span> Tên đăng nhập
              </label>
              <div className="input-with-icon">
                <span className="input-icon">@</span>
                <input
                  id="reg-username"
                  type="text"
                  className="form-control-custom"
                  placeholder="Ít nhất 5 ký tự, chỉ chữ và số"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <small className="form-hint">Ví dụ: nguoidung123</small>
            </div>

            <div className="form-group-custom">
              <label className="form-label" htmlFor="reg-password">
                <span className="label-icon">🔒</span> Mật khẩu
              </label>
              <div className="input-with-icon">
                <span className="input-icon">🔑</span>
                <input
                  id="reg-password"
                  type="password"
                  className="form-control-custom"
                  placeholder="Ít nhất 8 ký tự, có ký tự đặc biệt"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <small className="form-hint">Phải có ít nhất 1 ký tự: !@#$%^&*</small>
            </div>

            <div className="form-group-custom">
              <label className="form-label" htmlFor="reg-confirm">
                <span className="label-icon">✅</span> Xác nhận mật khẩu
              </label>
              <div className="input-with-icon">
                <span className="input-icon">🔐</span>
                <input
                  id="reg-confirm"
                  type="password"
                  className="form-control-custom"
                  placeholder="Nhập lại mật khẩu"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary-custom w-100 mt-4 ripple"
            >
              <span className="btn-text">Đăng ký</span>
              <span className="btn-arrow">→</span>
            </button>
          </form>

          <div className="auth-footer">
            <span className="text-muted">Đã có tài khoản? </span>
            <Link to="/login" className="auth-link">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;