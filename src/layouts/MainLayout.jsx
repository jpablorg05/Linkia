import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { PackageSearch, Bell, User, LogOut, MessageSquare, History, BarChart2, ShoppingBag, Moon, Sun, Store, Users, Zap, HeartHandshake, Award } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function MainLayout() {
  const { user, logout, notifications, chats, theme, toggleTheme, loyaltyPoints } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return <Outlet />;
  }

  const isBuyer = user.role === 'buyer';
  const unreadChats = chats.reduce((acc, c) => acc + c.unread, 0);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-main)', overflow: 'hidden' }}>
      
      {/* TOP NAVBAR */}
      <header style={{ height: '56px', background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '1rem', zIndex: 20, flexShrink: 0 }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginRight: '1.5rem' }} onClick={() => navigate(isBuyer ? '/search' : '/dashboard')}>
          <PackageSearch color="var(--primary)" size={24} />
          <span style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Linkia</span>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
          {isBuyer ? (
            <>
              <TopLink to="/search" label="Inicio" active={location.pathname === '/search'} />
              <TopLink to="/store/2" label="Tiendas" active={location.pathname.includes('/store')} />
              <TopLink to="/rewards" label="Club Linkia" active={location.pathname === '/rewards'} />
              <TopLink to="/orders" label="Pedidos" active={location.pathname === '/orders'} />
              <TopLink to="/history" label="Historial" active={location.pathname === '/history'} />
              <TopLink to="/inbox" label="Chat" active={location.pathname.includes('/inbox') || location.pathname.includes('/chat')} badge={unreadChats} />
            </>
          ) : (
            <>
              {(user.subRole === 'admin' || user.subRole === 'sales') && (
                <TopLink to="/dashboard" label="Inicio" active={location.pathname === '/dashboard'} />
              )}
              {user.subRole === 'admin' && (
                <TopLink to="/catalog" label="Catálogo" active={location.pathname === '/catalog'} />
              )}
              <TopLink to="/orders" label="Ventas" active={location.pathname === '/orders'} />
              {(user.subRole === 'admin' || user.subRole === 'sales') && (
                <TopLink to="/crm" label="Clientes" active={location.pathname === '/crm'} />
              )}
              {user.subRole === 'admin' && (
                <>
                  <TopLink to="/stats" label="Estadísticas" active={location.pathname === '/stats'} />
                  <TopLink to="/team" label="Equipo" active={location.pathname === '/team'} />
                </>
              )}
              <TopLink to="/inbox" label="Chat" active={location.pathname.includes('/inbox') || location.pathname.includes('/chat')} badge={unreadChats} />
            </>
          )}
        </nav>

        {/* Right Side Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>

          <Link to="/history" style={{ position: 'relative', color: 'var(--text-muted)', display: 'flex', padding: '0.4rem' }}>
            <Bell size={20} />
            {notifications.length > 0 && (
              <span style={{ position: 'absolute', top: 0, right: -2, background: 'var(--danger)', color: 'white', fontSize: '0.6rem', width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {notifications.length}
              </span>
            )}
          </Link>

          {isBuyer && (
            <Link to="/rewards" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', background: 'rgba(245, 158, 11, 0.1)', padding: '0.3rem 0.7rem', borderRadius: '20px', color: '#d97706', fontWeight: '600', fontSize: '0.8rem' }}>
              <Award size={14} />
              {loyaltyPoints}
            </Link>
          )}

          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', display: 'flex' }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }}></div>

          {/* Profile Dropdown Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.85rem' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-main)' }}>{user.name?.split(' ')[0]}</span>
          </div>

          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', display: 'flex' }} title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>

      </header>

      {/* SCROLLABLE CONTENT */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

    </div>
  );
}

function TopLink({ to, label, active, badge }) {
  return (
    <Link 
      to={to} 
      style={{ 
        position: 'relative',
        color: active ? 'var(--text-main)' : 'var(--text-muted)', 
        textDecoration: 'none', 
        padding: '0.45rem 0.8rem',
        borderRadius: '6px',
        fontSize: '0.88rem',
        fontWeight: active ? '600' : '400',
        background: active ? 'var(--bg-main)' : 'transparent',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--text-main)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--text-muted)';
      }}
    >
      {label}
      {badge > 0 && (
        <span style={{ position: 'absolute', top: -2, right: -6, background: 'var(--danger)', color: 'white', fontSize: '0.6rem', minWidth: 16, height: 16, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', padding: '0 4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {badge}
        </span>
      )}
    </Link>
  );
}
