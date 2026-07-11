import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, MessageSquare } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function ChatListSidebar() {
  const { chats } = useAppContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const activeChatId = parseInt(id);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chats.filter(c => c.partnerName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ 
      width: '350px', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'var(--bg-panel)',
      borderRight: '1px solid var(--border-color)',
      flexShrink: 0
    }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>Chats</h2>
        
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-main)', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: 'var(--text-main)', fontSize: '0.85rem' }} 
          />
        </div>
      </div>

      {/* Chat List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredChats.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={32} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '0.9rem', margin: 0 }}>No hay conversaciones</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredChats.map(chat => {
              const isActive = chat.id === activeChatId;
              
              return (
                <div 
                  key={chat.id} 
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  style={{ 
                    padding: '1rem 1.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(14, 165, 233, 0.05)' : 'transparent',
                    borderBottom: '1px solid var(--border-color)',
                    position: 'relative',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => { if(!isActive) e.currentTarget.style.background = 'var(--bg-main)' }}
                  onMouseLeave={e => { if(!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  {isActive && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--primary)' }} />}

                  {/* Avatar */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-main)', overflow: 'hidden' }}>
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chat.partnerName)}&background=0D8ABC&color=fff&size=128&bold=true`} alt={chat.partnerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    {chat.unread > 0 && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: '50%', background: '#10b981', border: '2px solid var(--bg-panel)' }}></div>}
                  </div>
                  
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: isActive || chat.unread > 0 ? '700' : '600', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {chat.partnerName}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: chat.unread > 0 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: chat.unread > 0 ? '700' : '500' }}>
                        {chat.date}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: chat.unread > 0 ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: chat.unread > 0 ? '600' : '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
