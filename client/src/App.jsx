import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountManagementPage from './pages/AccountManagementPage';
import DashboardPage from './pages/DashboardPage';
import NhapLoPage from './pages/NhapLoPage';

function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand">
          🏥 Quản lý Kho Dược
        </Link>
        <div className="ms-auto d-flex gap-2 align-items-center">
          <span className="text-white me-2 fw-semibold">
            👋 {user.username}
          </span>
          {user.isAdmin && (
            <Link to="/admin/users" className="btn btn-outline-warning btn-sm">
              ⚙️ QLTK
            </Link>
          )}
          <Link to="/nhap-lo" className="btn btn-outline-success btn-sm">
            ➕ Nhập Lô
          </Link>
          <button onClick={logout} className="btn btn-outline-light btn-sm">
            🚪 Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
}

function AppRouter() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="text-center mt-5 pt-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-3 text-muted">Đang tải ứng dụng...</p>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="container-fluid p-0">
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
          <Route path="/admin/users" element={user?.isAdmin ? <AccountManagementPage /> : <Navigate to="/" />} />
          <Route path="/nhap-lo" element={user ? <NhapLoPage /> : <Navigate to="/login" />} />
          <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
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