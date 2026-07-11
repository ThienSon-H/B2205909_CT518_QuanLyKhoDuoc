import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountManagementPage from './pages/AccountManagementPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DashboardPage from './pages/DashboardPage';
import NhapLoPage from './pages/NhapLoPage';
import BaoCaoPage from './pages/BaoCaoPage';
import LichSuPage from './pages/LichSuPage';
import DanhMucPage from './pages/DanhMucPage';
import QuanLyThuocPage from './pages/QuanLyThuocPage.jsx';

function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav className="navbar-custom">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand" aria-label="Trang chủ">
          <span className="brand-icon">⚕️</span>
          <span className="brand-text">Quản lý Kho Dược</span>
        </Link>

        <div className="nav-actions">
          <div className="user-greeting">
            <span className="user-avatar">👤</span>
            <span className="user-name">{user.username}</span>
          </div>

          <div className="nav-links">
            {user.isAdmin && (
              <>
                <Link to="/admin/users" className="btn btn-outline-warning btn-sm ripple">
                  <span className="btn-icon">⚙️</span> QLTK
                </Link>
                <Link to="/admin/danh-muc" className="btn btn-outline-warning btn-sm ripple">
                  <span className="btn-icon">📋</span> Danh mục
                </Link>
                <Link to="/admin/thuoc" className="btn btn-outline-warning btn-sm ripple">
                  <span className="btn-icon">💊</span> Thuốc
                </Link>
              </>
            )}
            <Link to="/nhap-lo" className="btn btn-outline-success btn-sm ripple">
              <span className="btn-icon">➕</span> Nhập Lô
            </Link>
            <Link to="/bao-cao" className="btn btn-outline-info btn-sm ripple">
              <span className="btn-icon">📊</span> Báo cáo
            </Link>
            <Link to="/lich-su" className="btn btn-outline-info btn-sm ripple">
              <span className="btn-icon">🕒</span> Lịch sử
            </Link>
            <Link to="/doi-mat-khau" className="btn btn-outline-light btn-sm ripple">
              <span className="btn-icon">🔑</span> Đổi MK
            </Link>
            <button onClick={logout} className="btn btn-danger-custom btn-sm ripple">
              <span className="btn-icon">🚪</span> Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="loading-text">Đang tải ứng dụng...</p>
          <div className="loading-bar">
            <div className="loading-bar-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
          <Route path="/admin/users" element={user?.isAdmin ? <AccountManagementPage /> : <Navigate to="/" />} />
          <Route path="/nhap-lo" element={user ? <NhapLoPage /> : <Navigate to="/login" />} />
          <Route path="/bao-cao" element={user ? <BaoCaoPage /> : <Navigate to="/login" />} />
          <Route path="/lich-su" element={user ? <LichSuPage /> : <Navigate to="/login" />} />
          <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/doi-mat-khau" element={user ? <ChangePasswordPage /> : <Navigate to="/login" />} />
          <Route path="/admin/danh-muc" element={user?.isAdmin ? <DanhMucPage /> : <Navigate to="/" />} />
          <Route path="/admin/thuoc" element={user?.isAdmin ? <QuanLyThuocPage /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;