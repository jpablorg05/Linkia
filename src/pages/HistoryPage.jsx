import React from 'react';
import { useAppContext } from '../context/AppContext';
import { History, Search, Bell, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HistoryPage() {
  const { searchHistory, notifications, user } = useAppContext();

  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>
        {user.role === 'buyer' ? 'Historial de Búsquedas' : 'Historial de Notificaciones'}
      </h2>

      {user.role === 'buyer' && searchHistory.length === 0 ? (
        <div className="card-panel flex-center" style={{ padding: '4rem', flexDirection: 'column', color: 'var(--text-muted)' }}>
          <History size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h3>No hay búsquedas recientes</h3>
          <p>Tus búsquedas pasadas aparecerán aquí.</p>
        </div>
      ) : user.role === 'buyer' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {searchHistory.map((sh, idx) => (
            <div key={idx} className="card-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search size={20} color="var(--text-muted)" />
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{sh.term}</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{sh.date}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications && notifications.length > 0 ? (
            notifications.map((notif, idx) => {
              const content = (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--bg-main)', padding: '0.6rem', borderRadius: '50%' }}>
                      <Bell size={20} color="var(--primary)" />
                    </div>
                    <span style={{ fontSize: '1.05rem', fontWeight: '500', color: 'var(--text-main)' }}>{notif.text}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500', background: 'var(--bg-main)', padding: '0.3rem 0.8rem', borderRadius: '12px' }}>{notif.date}</span>
                    {notif.link && <ChevronRight size={18} color='var(--text-muted)' />}
                  </div>
                </>
              );

              const style = { padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s', cursor: notif.link ? 'pointer' : 'default', textDecoration: 'none', color: 'inherit' };

              if (notif.link) {
                return (
                  <Link 
                    key={idx} 
                    to={notif.link}
                    className="card-panel hover-card" 
                    style={style} 
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div key={idx} className="card-panel" style={style}>
                  {content}
                </div>
              );
            })
          ) : (
            <div className="card-panel flex-center" style={{ padding: '4rem', flexDirection: 'column', color: 'var(--text-muted)' }}>
              <History size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <h3>Historial de Notificaciones</h3>
              <p>Tus notificaciones pasadas aparecerán aquí.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
