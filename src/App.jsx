import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import MainLayout from './layouts/MainLayout';

// Pages
import AuthPage from './pages/AuthPage';
import PublicHomePage from './pages/PublicHomePage';
import SearchPage from './pages/SearchPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import ChatWorkspace from './pages/ChatWorkspace';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import StatsPage from './pages/StatsPage';
import HistoryPage from './pages/HistoryPage';
import PaymentMockPage from './pages/PaymentMockPage';
import StorefrontPage from './pages/StorefrontPage';
import CatalogPage from './pages/CatalogPage';
import TeamPage from './pages/TeamPage';
import CrmPage from './pages/CrmPage';
import RewardsPage from './pages/RewardsPage';

// Ruta de inicio según el rol del usuario
const homePath = (role) => (role === 'buyer' ? '/' : role === 'admin' ? '/admin' : '/dashboard');

// Protectors
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAppContext();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={homePath(user.role)} replace />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAppContext();

  return (
    <Routes>
      {/* Home Público (marketplace) — accesible sin login */}
      <Route path="/" element={<PublicHomePage />} />

      {/* Login / Registro */}
      <Route path="/auth" element={user ? <Navigate to={homePath(user.role)} replace /> : <AuthPage />} />

      {/* Rutas Protegidas (Sin MainLayout para vistas full-bleed) */}
      <Route path="/search" element={<ProtectedRoute allowedRoles={['buyer']}><SearchPage /></ProtectedRoute>} />

      <Route element={<MainLayout />}>
        
        {/* Empresa/Vendedor */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboardPage /></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute allowedRoles={['seller']}><StatsPage /></ProtectedRoute>} />
        <Route path="/catalog" element={<ProtectedRoute allowedRoles={['seller']}><CatalogPage /></ProtectedRoute>} />
        <Route path="/team" element={<ProtectedRoute allowedRoles={['seller']}><TeamPage /></ProtectedRoute>} />
        <Route path="/crm" element={<ProtectedRoute allowedRoles={['seller']}><CrmPage /></ProtectedRoute>} />

        {/* Administrador */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['admin']}><AdminProductsPage /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminOrdersPage /></ProtectedRoute>} />

        {/* Comunes */}
        <Route path="/inbox" element={<ProtectedRoute><ChatWorkspace /></ProtectedRoute>} />
        <Route path="/chat/:id" element={<ProtectedRoute><ChatWorkspace /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/payment/:orderId" element={<ProtectedRoute><PaymentMockPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute allowedRoles={['buyer']}><RewardsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/store/:id" element={<ProtectedRoute><StorefrontPage /></ProtectedRoute>} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}
