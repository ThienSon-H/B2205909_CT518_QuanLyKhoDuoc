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
          📝 Đăng ký tài khoản
        </div>
        <div className="p-4">
          {message && <div className="alert alert-success alert-custom">{message}</div>}
          {error && <div className="alert alert-danger alert-custom">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Tên đăng nhập</label>
              <input
                type="text"
                className="form-control-custom w-100"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <small className="text-muted">Ít nhất 5 ký tự, chỉ chữ và số</small>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Mật khẩu</label>
              <input
                type="password"
                className="form-control-custom w-100"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <small className="text-muted">Ít nhất 8 ký tự, bao gồm 1 ký tự đặc biệt</small>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Xác nhận mật khẩu</label>
              <input
                type="password"
                className="form-control-custom w-100"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary-custom w-100 mt-3">
              Đăng ký
            </button>
          </form>
          <div className="text-center mt-4">
            <span className="text-muted">Đã có tài khoản? </span>
            <Link to="/login" className="fw-semibold">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;