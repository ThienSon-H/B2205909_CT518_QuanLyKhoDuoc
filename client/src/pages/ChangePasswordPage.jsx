import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CHANGE_PASSWORD_URL = 'https://localhost:7122/api/Auth/change-password';

function ChangePasswordPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const validateForm = () => {
    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự');
      return false;
    }
    const specialRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (!specialRegex.test(newPassword)) {
      setError('Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateForm()) return;

    try {
      const res = await axios.post(CHANGE_PASSWORD_URL, {
        username: user?.username,
        oldPassword,
        newPassword
      });

      if (res.data.message.startsWith('LỖI')) {
        setError(res.data.message);
      } else {
        setMessage('Đổi mật khẩu thành công!');
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi kết nối server');
    }
  };

  return (
    <div className="page-wrapper fade-in">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card-custom">
            <div className="card-header">
              🔑 Đổi mật khẩu
            </div>
            <div className="card-body p-4">
              {message && <div className="alert alert-success alert-custom">{message}</div>}
              {error && <div className="alert alert-danger alert-custom">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group-custom">
                  <label className="form-label fw-semibold">Mật khẩu cũ</label>
                  <input
                    type="password"
                    className="form-control-custom w-100"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group-custom">
                  <label className="form-label fw-semibold">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-control-custom w-100"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <small className="text-muted">Ít nhất 8 ký tự, bao gồm 1 ký tự đặc biệt</small>
                </div>
                <div className="form-group-custom">
                  <label className="form-label fw-semibold">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-control-custom w-100"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary-custom w-100 mt-3">
                  Cập nhật mật khẩu
                </button>
              </form>
              <div className="text-center mt-3">
                <Link to="/" className="text-muted">← Quay lại Dashboard</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordPage;