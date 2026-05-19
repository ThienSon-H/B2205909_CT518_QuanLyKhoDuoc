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

  // Hàm kiểm tra đầu vào (client-side validation)
  const validateInput = () => {
    // 1. Username: ít nhất 5 ký tự, chỉ chữ và số
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (username.length < 5) {
      setError('Tên đăng nhập phải có ít nhất 5 ký tự');
      return false;
    }
    if (!usernameRegex.test(username)) {
      setError('Tên đăng nhập chỉ được chứa chữ cái và số, không ký tự đặc biệt');
      return false;
    }

    // 2. Password: ít nhất 8 ký tự, có ít nhất 1 ký tự đặc biệt
    const passwordRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }
    if (!passwordRegex.test(password)) {
      setError('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (ví dụ: !@#$%^&*)');
      return false;
    }

    // 3. Xác nhận mật khẩu khớp
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
    // Kiểm tra nếu message không bắt đầu bằng "LỖI" thì coi như thành công
    if (!res.data.message.startsWith('LỖI')) {
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
              <small className="text-muted">Ít nhất 5 ký tự, chỉ chữ và số</small>
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
              <small className="text-muted">Ít nhất 8 ký tự, bao gồm 1 ký tự đặc biệt (!@#$%^&*)</small>
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