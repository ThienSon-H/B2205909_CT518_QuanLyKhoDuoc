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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      const res = await axios.post('https://localhost:7122/api/Auth/register', {
        username,
        password
      });
      if (res.data.message.includes('thành công')) {
        setMessage('Đăng ký thành công! Vui lòng đăng nhập.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <div className="card shadow">
        <div className="card-header bg-success text-white text-center">
          <h3>Đăng ký tài khoản</h3>
        </div>
        <div className="card-body">
          {message && <div className="alert alert-success">{message}</div>}
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
            <div className="mb-3">
              <label>Xác nhận mật khẩu</label>
              <input
                type="password"
                className="form-control"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-success w-100">
              Đăng ký
            </button>
          </form>
          <div className="text-center mt-3">
            <Link to="/login">Đã có tài khoản? Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;