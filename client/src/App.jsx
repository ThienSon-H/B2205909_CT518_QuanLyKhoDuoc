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
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid">
        <span className="navbar-brand">🏥 Quản lý Kho Dược</span>
        <div className="ms-auto d-flex gap-3 align-items-center">
          <span className="text-white">Xin chào, {user.username}</span>
          {user.isAdmin && (
            <Link to="/admin/users" className="btn btn-outline-warning btn-sm">
              QLTK
            </Link>
          )}
          <Link to="/nhap-lo" className="btn btn-outline-success btn-sm">
            + Nhập Lô
          </Link>
          <button onClick={logout} className="btn btn-outline-light btn-sm">
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
}

function AppRouter() {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Đang tải ứng dụng...</div>;
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/admin/users" element={user?.isAdmin ? <AccountManagementPage /> : <Navigate to="/" />} />
        <Route path="/nhap-lo" element={user ? <NhapLoPage /> : <Navigate to="/login" />} />
        <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
      </Routes>
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