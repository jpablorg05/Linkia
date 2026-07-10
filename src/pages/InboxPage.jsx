import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Store, User } from 'lucide-react';

export default function InboxPage() {
  const { chats, user } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Bandeja de Mensajes</h2>
      
      {chats.length === 0 ? (
        <div className="card-panel flex-center" style={{ padding: '4rem', flexDirection: 'column', color: 'var(--text-muted)' }}>
          <MessageSquare size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h3>No tienes mensajes</h3>
          <p>Tus conversaciones activas aparecerán aquí.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {chats.map(chat => (
            <div 
              key={chat.id} 
              className="card-panel"
              style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderLeft: chat.unread > 0 ? '4px solid #e77600' : '1px solid #d5d9d9' }}
              onClick={() => navigate(`/chat/${chat.id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#e3e6e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {user.role === 'buyer' ? <Store size={24} color='var(--text-muted)' /> : <User size={24} color='var(--text-muted)' />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: chat.unread > 0 ? 'bold' : 'normal' }}>{chat.partnerName}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, fontWeight: chat.unread > 0 ? 'bold' : 'normal' }}>
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{chat.date}</div>
                {chat.unread > 0 && (
                  <span style={{ background: 'var(--danger)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
