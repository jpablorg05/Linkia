import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { PackageSearch, Bell, User, LogOut, MessageSquare, History, BarChart2, ShoppingBag, Moon, Sun, Store, Users, Zap, HeartHandshake, Award } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function MainLayout() {
  const { user, logout, notifications, chats, theme, toggleTheme, loyaltyPoints, buyerOrders } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return <Outlet />;
  }

  // Solo hacemos transparente el header si es la landing de comprador, el dashboard de vendedor, o el catálogo de tiendas
  const isImmersivePath = location.pathname === '/' || location.pathname === '/dashboard' || location.pathname.includes('/store');
  const isImmersive = (user.role === 'buyer' || user.role === 'seller') && isImmersivePath;

  const unreadChats = chats.reduce((acc, c) => acc + c.unread, 0);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-main)', overflow: 'hidden' }}>
      
      {/* TOP NAVBAR */}
      <header style={{ 
        position: isImmersive ? 'absolute' : 'relative',
        top: 0, left: 0, right: 0,
        height: '56px', 
        background: isImmersive ? 'transparent' : 'var(--bg-panel)', 
        borderBottom: isImmersive ? 'none' : '1px solid var(--border-color)', 
        display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '1rem',
        zIndex: 20, flexShrink: 0
      }} className="app-header">
        
        {/* Logo */}
        <div className="app-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginRight: '1.5rem' }} onClick={() => navigate(user.role === 'admin' ? '/admin' : user.role === 'buyer' ? '/' : '/dashboard')}>
          <PackageSearch color={isImmersive ? '#00a3e0' : 'var(--primary)'} size={24} />
          <span style={{ fontSize: '1.3rem', fontWeight: '700', color: isImmersive ? '#fff' : 'var(--text-main)', letterSpacing: '-0.5px' }}>Linkia</span>
        </div>

        {/* Nav Links */}
        <nav className="app-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
          {user.role === 'buyer' ? (
            <>
              <TopLink to="/" label="Inicio" active={location.pathname === '/'} isDarkHeader={isImmersive} />
              <TopLink to="/store/2" label="Tiendas" active={location.pathname.includes('/store')} isDarkHeader={isImmersive} />
              <TopLink to="/rewards" label="Club Linkia" active={location.pathname === '/rewards'} isDarkHeader={isImmersive} />
              <TopLink to="/orders" label="Pedidos" active={location.pathname === '/orders'} isDarkHeader={isImmersive} />
              <TopLink to="/history" label="Historial" active={location.pathname === '/history'} isDarkHeader={isImmersive} />
              <TopLink to="/inbox" label="Chat" active={location.pathname.includes('/inbox') || location.pathname.includes('/chat')} badge={unreadChats} isDarkHeader={isImmersive} />
            </>
          ) : user.role === 'admin' ? (
            <>
              <TopLink to="/admin" label="Inicio" active={location.pathname === '/admin'} />
              <TopLink to="/admin/users" label="Usuarios" active={location.pathname === '/admin/users'} />
              <TopLink to="/admin/products" label="Productos" active={location.pathname === '/admin/products'} />
              <TopLink to="/admin/orders" label="Ventas" active={location.pathname === '/admin/orders'} />
              <TopLink to="/inbox" label="Chat" active={location.pathname.includes('/inbox') || location.pathname.includes('/chat')} badge={unreadChats} />
            </>
          ) : (
            <>
              <TopLink to="/dashboard" label="Inicio" active={location.pathname === '/dashboard'} isDarkHeader={isImmersive} />
              {user.subRole === 'admin' && (
                <TopLink to="/catalog" label="Catálogo" active={location.pathname === '/catalog'} isDarkHeader={isImmersive} />
              )}
              <TopLink to="/orders" label="Ventas" active={location.pathname === '/orders'} isDarkHeader={isImmersive} />
              {(user.subRole === 'admin' || user.subRole === 'sales') && (
                <TopLink to="/crm" label="Clientes" active={location.pathname === '/crm'} isDarkHeader={isImmersive} />
              )}
              {user.subRole === 'admin' && (
                <>
                  <TopLink to="/stats" label="Estadísticas" active={location.pathname === '/stats'} isDarkHeader={isImmersive} />
                  <TopLink to="/team" label="Equipo" active={location.pathname === '/team'} isDarkHeader={isImmersive} />
                </>
              )}
              <TopLink to="/inbox" label="Chat" active={location.pathname.includes('/inbox') || location.pathname.includes('/chat')} badge={unreadChats} isDarkHeader={isImmersive} />
              <TopLink to="/" label="Ver marketplace" active={false} isDarkHeader={isImmersive} />
            </>
          )}
        </nav>

        {/* Right Side Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>

          <Link to="/history" style={{ position: 'relative', color: isImmersive ? '#fff' : 'var(--text-muted)', display: 'flex', padding: '0.4rem' }}>
            <Bell size={20} />
            {notifications.length > 0 && (
              <span style={{ position: 'absolute', top: 0, right: -2, background: 'var(--danger)', color: 'white', fontSize: '0.6rem', width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {notifications.length}
              </span>
            )}
          </Link>

          {user.role === 'buyer' && (
            <div style={{ display: 'flex', gap: '0.5rem', marginRight: '0.5rem' }}>
              <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', background: 'rgba(14, 165, 233, 0.2)', padding: '0.3rem 0.7rem', borderRadius: '20px', color: '#38bdf8', fontWeight: '600', fontSize: '0.8rem' }} title="Tus pedidos en curso">
                <ShoppingBag size={14} />
                {buyerOrders?.length || 0}
              </Link>
              <Link to="/rewards" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', background: 'rgba(245, 158, 11, 0.2)', padding: '0.3rem 0.7rem', borderRadius: '20px', color: '#fcd34d', fontWeight: '600', fontSize: '0.8rem' }} title="Tus puntos Linkia">
                <Award size={14} />
                {loyaltyPoints}
              </Link>
            </div>
          )}

          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: isImmersive ? '#fff' : 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', display: 'flex' }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div style={{ width: '1px', height: '20px', background: isImmersive ? 'rgba(255,255,255,0.2)' : 'var(--border-color)' }}></div>

          {/* Profile Dropdown Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: isImmersive ? 'rgba(255,255,255,0.1)' : 'var(--primary)', color: isImmersive ? '#fff' : '#fff', border: isImmersive ? '1px solid rgba(255,255,255,0.2)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="nav-username" style={{ fontSize: '0.85rem', fontWeight: '500', color: isImmersive ? '#fff' : 'var(--text-main)' }}>{user.name?.split(' ')[0]}</span>
          </div>

          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: isImmersive ? '#fff' : 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', display: 'flex' }} title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>

      </header>

      {/* SCROLLABLE CONTENT */}
      <main style={{ flex: 1, overflowY: 'auto', padding: isImmersive ? '0' : ((location.pathname === '/search' || location.pathname.includes('/chat') || location.pathname.includes('/inbox')) ? '0' : '2rem') }}>
        <div style={{ maxWidth: isImmersive ? '100%' : ((location.pathname === '/search' || location.pathname.includes('/chat') || location.pathname.includes('/inbox')) ? '100%' : '1200px'), margin: '0 auto', height: '100%' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 860px) {
          .app-header { padding: 0 0.7rem !important; gap: 0.4rem !important; }
          .app-logo { margin-right: 0.4rem !important; }
          .app-nav {
            overflow-x: auto;
            min-width: 0;
            flex-wrap: nowrap;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .app-nav::-webkit-scrollbar { display: none; }
          .nav-username { display: none !important; }
        }
      `}</style>

    </div>
  );
}

function TopLink({ to, label, active, badge, isDarkHeader }) {
  return (
    <Link 
      to={to} 
      style={{ 
        position: 'relative',
        color: active ? (isDarkHeader ? '#fff' : 'var(--text-main)') : (isDarkHeader ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'), 
        textDecoration: 'none', 
        padding: '0.45rem 0.8rem',
        borderRadius: '6px',
        fontSize: '0.88rem',
        fontWeight: active ? '600' : '400',
        background: active ? (isDarkHeader ? 'rgba(255,255,255,0.1)' : 'var(--bg-main)') : 'transparent',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = isDarkHeader ? '#fff' : 'var(--text-main)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = isDarkHeader ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)';
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
