import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import MainLayout from './layouts/MainLayout';

// Pages
import AuthPage from './pages/AuthPage';
import SearchPage from './pages/SearchPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import InboxPage from './pages/InboxPage';
import ChatPage from './pages/ChatPage';
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

// Protectors
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAppContext();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'buyer' ? '/search' : '/dashboard'} replace />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAppContext();

  return (
    <Routes>
      {/* Rutas Públicas / Auth */}
      <Route path="/" element={user ? <Navigate to={user.role === 'buyer' ? '/search' : '/dashboard'} replace /> : <AuthPage />} />

      {/* Rutas Protegidas */}
      <Route element={<MainLayout />}>
        {/* Comprador */}
        <Route path="/search" element={<ProtectedRoute allowedRoles={['buyer']}><SearchPage /></ProtectedRoute>} />
        
        {/* Empresa/Vendedor */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboardPage /></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute allowedRoles={['seller']}><StatsPage /></ProtectedRoute>} />
        <Route path="/catalog" element={<ProtectedRoute allowedRoles={['seller']}><CatalogPage /></ProtectedRoute>} />
        <Route path="/team" element={<ProtectedRoute allowedRoles={['seller']}><TeamPage /></ProtectedRoute>} />
        <Route path="/crm" element={<ProtectedRoute allowedRoles={['seller']}><CrmPage /></ProtectedRoute>} />

        {/* Comunes */}
        <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
        <Route path="/chat/:id" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
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
