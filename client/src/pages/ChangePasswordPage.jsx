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
              <span>🔑 Đổi mật khẩu</span>
            </div>
            <div className="card-body p-4">
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
                  <label className="form-label" htmlFor="old-password">
                    <span className="label-icon">🔒</span> Mật khẩu cũ
                  </label>
                  <div className="input-with-icon">
                    <span className="input-icon">🔑</span>
                    <input
                      id="old-password"
                      type="password"
                      className="form-control-custom"
                      placeholder="Nhập mật khẩu hiện tại"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-custom">
                  <label className="form-label" htmlFor="new-password">
                    <span className="label-icon">🆕</span> Mật khẩu mới
                  </label>
                  <div className="input-with-icon">
                    <span className="input-icon">✨</span>
                    <input
                      id="new-password"
                      type="password"
                      className="form-control-custom"
                      placeholder="Ít nhất 8 ký tự, có ký tự đặc biệt"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <small className="form-hint">Ít nhất 8 ký tự, bao gồm 1 ký tự đặc biệt</small>
                </div>

                <div className="form-group-custom">
                  <label className="form-label" htmlFor="confirm-password">
                    <span className="label-icon">✅</span> Xác nhận mật khẩu mới
                  </label>
                  <div className="input-with-icon">
                    <span className="input-icon">🔐</span>
                    <input
                      id="confirm-password"
                      type="password"
                      className="form-control-custom"
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary-custom w-100 mt-4 ripple"
                >
                  <span className="btn-text">Cập nhật mật khẩu</span>
                  <span className="btn-arrow">→</span>
                </button>
              </form>

              <div className="text-center mt-4">
                <Link to="/" className="auth-link">← Quay lại Dashboard</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordPage;