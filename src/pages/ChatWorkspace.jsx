import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import ChatListSidebar from '../components/chat/ChatListSidebar';
import ChatArea from '../components/chat/ChatArea';
import ChatDetailsSidebar from '../components/chat/ChatDetailsSidebar';

export default function ChatWorkspace() {
  const { id } = useParams();
  const activeChatId = id ? parseInt(id) : null;
  const [activeItemName, setActiveItemName] = useState(null);

  return (
    <div className="animate-fade-in" style={{ 
      display: 'flex', 
      height: '100%', 
      width: '100%', 
      background: 'var(--bg-panel)',
      overflow: 'hidden'
    }}>
      
      {/* Columna 1: Lista de Chats */}
      <ChatListSidebar />

      {/* Columna 2: Área del Chat Activo */}
      {activeChatId ? (
        <ChatArea partnerId={activeChatId} onActiveItemChange={setActiveItemName} />
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-muted)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <MessageSquare size={32} color="var(--primary)" />
          </div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Tus Mensajes</h2>
          <p>Selecciona una conversación a la izquierda para comenzar a chatear.</p>
        </div>
      )}

      {/* Columna 3: Detalles del Partner */}
      {activeChatId && (
        <ChatDetailsSidebar partnerId={activeChatId} activeItemName={activeItemName} />
      )}

    </div>
  );
}
